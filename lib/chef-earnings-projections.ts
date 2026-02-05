/**
 * Phase 2AC — Chef earnings projections.
 * Confirmed = sum of assigned payouts. Estimated = available days × historical avg payout × fill-rate range.
 * No new schema. Admin can disable via EARNINGS_PROJECTIONS_ENABLED.
 */

import { db } from '@/lib/db'

function toDateKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateKey(key: string): Date {
  return new Date(key + 'T12:00:00.000Z')
}

/**
 * Days in [start, end] (inclusive) where chef has no assignment and is available
 * (explicit available=true or no availability record = default available).
 */
export async function countAvailableDaysInRange(
  chefId: string,
  start: Date,
  end: Date
): Promise<number> {
  const startKey = toDateKey(start)
  const endKey = toDateKey(end)
  const [assignments, availability] = await Promise.all([
    db.chefAssignment.findMany({
      where: {
        chefId,
        booking: { eventDate: { gte: start, lte: end } },
      },
      select: { booking: { select: { eventDate: true } } },
    }),
    db.chefAvailability.findMany({
      where: { chefId, date: { gte: start, lte: end } },
      select: { date: true, available: true },
    }),
  ])
  const assignedDates = new Set(
    assignments.map((a) => toDateKey(new Date(a.booking.eventDate)))
  )
  const availabilityByDate = new Map(
    availability.map((r) => [toDateKey(r.date), r.available])
  )
  let count = 0
  const cursor = new Date(parseDateKey(startKey))
  const endD = parseDateKey(endKey)
  while (cursor <= endD) {
    const key = toDateKey(cursor)
    if (assignedDates.has(key)) {
      cursor.setUTCDate(cursor.getUTCDate() + 1)
      continue
    }
    const avail = availabilityByDate.get(key)
    if (avail === undefined || avail) count++
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return count
}

/**
 * Sum of chefPayoutAmountCents for confirmed assignments (CONFIRMED, IN_PREP, COMPLETED) in range.
 */
export async function getConfirmedPayoutInRange(
  chefId: string,
  start: Date,
  end: Date
): Promise<number> {
  const rows = await db.chefAssignment.findMany({
    where: {
      chefId,
      status: { in: ['CONFIRMED', 'IN_PREP', 'COMPLETED'] },
      booking: { eventDate: { gte: start, lte: end } },
    },
    select: { booking: { select: { chefPayoutAmountCents: true } } },
  })
  return rows.reduce(
    (sum, r) => sum + (r.booking.chefPayoutAmountCents ?? 0),
    0
  )
}

/**
 * Historical average payout per job (completed, with payout set) over last 12 months.
 */
export async function getHistoricalAvgPayoutPerJob(chefId: string): Promise<number> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const rows = await db.chefAssignment.findMany({
    where: {
      chefId,
      status: 'COMPLETED',
      booking: {
        eventDate: { gte: twelveMonthsAgo },
        chefPayoutAmountCents: { not: null },
      },
    },
    select: { booking: { select: { chefPayoutAmountCents: true } } },
  })
  const cents = (rows.map((r) => r.booking.chefPayoutAmountCents) as (number | null)[]).filter(
    (c): c is number => c != null && c > 0
  )
  if (cents.length === 0) return 0
  return Math.round(cents.reduce((a, b) => a + b, 0) / cents.length)
}

export type PeriodProjection = {
  label: string
  confirmedCents: number
  availableDays: number
  /** Min estimate from open slots (availableDays × avgPayout × low fill). */
  estimatedCentsMin: number
  /** Max estimate from open slots. */
  estimatedCentsMax: number
}

export type EarningsProjectionsResult = {
  disabled: boolean
  thisMonth: PeriodProjection
  next30Days: PeriodProjection
  next90Days: PeriodProjection
}

/**
 * Get earnings projections for a chef.
 * If EARNINGS_PROJECTIONS_ENABLED is 'false', estimates are zeroed and disabled=true.
 */
export async function getEarningsProjections(
  chefId: string,
  options?: { projectionsEnabled?: boolean }
): Promise<EarningsProjectionsResult> {
  const enabled =
    options?.projectionsEnabled ??
    (process.env.EARNINGS_PROJECTIONS_ENABLED !== 'false')
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)

  const thisMonthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1)
  const thisMonthEnd = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)
  const next30End = new Date(todayStart)
  next30End.setUTCDate(next30End.getUTCDate() + 30)
  const next90End = new Date(todayStart)
  next90End.setUTCDate(next90End.getUTCDate() + 90)

  const [
    confirmedThisMonth,
    confirmedNext30,
    confirmedNext90,
    availableThisMonth,
    availableNext30,
    availableNext90,
    avgPayout,
  ] = await Promise.all([
    getConfirmedPayoutInRange(chefId, thisMonthStart, thisMonthEnd),
    getConfirmedPayoutInRange(chefId, todayStart, next30End),
    getConfirmedPayoutInRange(chefId, todayStart, next90End),
    countAvailableDaysInRange(chefId, thisMonthStart, thisMonthEnd),
    countAvailableDaysInRange(chefId, todayStart, next30End),
    countAvailableDaysInRange(chefId, todayStart, next90End),
    getHistoricalAvgPayoutPerJob(chefId),
  ])

  const fillLow = 0.2
  const fillHigh = 0.6
  const est = (days: number) => ({
    min: Math.round(days * avgPayout * fillLow),
    max: Math.round(days * avgPayout * fillHigh),
  })

  const e30 = est(availableNext30)
  const e90 = est(availableNext90)
  const eMonth = est(availableThisMonth)

  return {
    disabled: !enabled,
    thisMonth: {
      label: 'This month',
      confirmedCents: confirmedThisMonth,
      availableDays: availableThisMonth,
      estimatedCentsMin: enabled ? eMonth.min : 0,
      estimatedCentsMax: enabled ? eMonth.max : 0,
    },
    next30Days: {
      label: 'Next 30 days',
      confirmedCents: confirmedNext30,
      availableDays: availableNext30,
      estimatedCentsMin: enabled ? e30.min : 0,
      estimatedCentsMax: enabled ? e30.max : 0,
    },
    next90Days: {
      label: 'Next 90 days',
      confirmedCents: confirmedNext90,
      availableDays: availableNext90,
      estimatedCentsMin: enabled ? e90.min : 0,
      estimatedCentsMax: enabled ? e90.max : 0,
    },
  }
}
