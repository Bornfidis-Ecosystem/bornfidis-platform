/**
 * Phase 2T — Monthly chef statements (read-only aggregation).
 * No new schema; uses ChefAssignment + BookingInquiry (PAID payouts).
 */

import { db } from '@/lib/db'

export type StatementJobRow = {
  bookingId: string
  serviceName: string
  eventDate: Date
  baseCents: number      // pre-tier base
  tierUpliftCents: number
  bonusCents: number
  totalCents: number
  paidAt: Date
}

export type ChefMonthStatement = {
  chefId: string
  chefName: string
  chefEmail: string
  year: number
  month: number
  monthLabel: string
  jobs: StatementJobRow[]
  totalBaseCents: number
  totalTierUpliftCents: number
  totalBonusCents: number
  totalPaidCents: number
  paymentDates: string[]
}

/**
 * Get statement data for one chef for a calendar month (PAID payouts only).
 * chefPayoutPaidAt determines inclusion (payment date in month).
 */
export async function getStatementDataForChefMonth(
  chefId: string,
  year: number,
  month: number
): Promise<ChefMonthStatement | null> {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  const chef = await db.user.findUnique({
    where: { id: chefId },
    select: { name: true, email: true },
  })
  if (!chef?.email) return null

  const assignments = await db.chefAssignment.findMany({
    where: {
      chefId,
      status: 'COMPLETED',
      booking: {
        chefPayoutStatus: 'paid',
        chefPayoutPaidAt: { gte: start, lte: end },
        chefPayoutAmountCents: { not: null },
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          eventDate: true,
          chefPayoutBaseCents: true,
          chefPayoutBonusCents: true,
          chefPayoutAmountCents: true,
          chefRateMultiplier: true,
          chefPayoutPaidAt: true,
        },
      },
    },
    orderBy: { booking: { chefPayoutPaidAt: 'asc' } },
  })

  if (assignments.length === 0) return null

  const jobs: StatementJobRow[] = []
  let totalBaseCents = 0
  let totalTierUpliftCents = 0
  let totalBonusCents = 0
  let totalPaidCents = 0
  const paymentDates: string[] = []

  for (const a of assignments) {
    const b = a.booking
    const totalCents = b.chefPayoutAmountCents ?? 0
    const baseCents = b.chefPayoutBaseCents ?? 0
    const bonusCents = b.chefPayoutBonusCents ?? 0
    const mult = (b.chefRateMultiplier ?? 1) || 1
    const baseBeforeTier = mult > 0 ? Math.round(baseCents / mult) : 0
    const tierUpliftCents = baseCents - baseBeforeTier
    const paidAt = b.chefPayoutPaidAt!

    jobs.push({
      bookingId: b.id,
      serviceName: b.name,
      eventDate: b.eventDate,
      baseCents: baseBeforeTier,
      tierUpliftCents,
      bonusCents,
      totalCents,
      paidAt,
    })
    totalBaseCents += baseBeforeTier
    totalTierUpliftCents += tierUpliftCents
    totalBonusCents += bonusCents
    totalPaidCents += totalCents
    paymentDates.push(paidAt.toISOString().split('T')[0])
  }

  const monthLabel = start.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return {
    chefId,
    chefName: chef.name ?? 'Chef',
    chefEmail: chef.email,
    year,
    month,
    monthLabel,
    jobs,
    totalBaseCents,
    totalTierUpliftCents,
    totalBonusCents,
    totalPaidCents,
    paymentDates: [...new Set(paymentDates)].sort(),
  }
}

/**
 * List chef IDs that have at least one PAID payout in the given month.
 */
export async function getChefIdsWithPaidJobsInMonth(
  year: number,
  month: number
): Promise<string[]> {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  const assignments = await db.chefAssignment.findMany({
    where: {
      status: 'COMPLETED',
      booking: {
        chefPayoutStatus: 'paid',
        chefPayoutPaidAt: { gte: start, lte: end },
      },
    },
    select: { chefId: true },
    distinct: ['chefId'],
  })

  return assignments.map((a) => a.chefId)
}
