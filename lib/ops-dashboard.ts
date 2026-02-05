/**
 * Phase 2AG — Ops Reporting Dashboard
 * KPIs and tables from Booking, ChefAssignment, Review, CoachingCase, Payout (chef payout on Booking), User.
 * No new schema.
 */

import { db } from '@/lib/db'

export type DateRangeKey = 'today' | '7d' | '30d'

function getRangeDates(range: DateRangeKey): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(now)
  if (range === 'today') {
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }
  if (range === '7d') {
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }
  // 30d
  start.setDate(start.getDate() - 29)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function getScheduledAt(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const parts = eventTime.trim().split(':').map(Number)
    d.setHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0)
  }
  return d
}

export type OpsKpis = {
  // Operations
  bookingsToday: number
  bookingsWeek: number
  completionRatePct: number
  avgAssignmentTimeHours: number
  // Quality
  avgRating: number
  lowRatingCount: number // ≤3 stars
  activeCoachingCases: number
  // People
  activeChefs: number
  availableToday: number
  featuredChefs: number
  // Finance (chef payouts on BookingInquiry)
  payoutsPending: number
  payoutsPaidMtd: number
  bonusPctApplied: number // % of MTD paid payouts that have bonus > 0
}

export type AtRiskRow = {
  bookingId: string
  bookingName: string
  chefId: string
  chefName: string | null
  reason: 'low_rating' | 'late' | 'missed_prep'
  detail: string
  eventDate: string
}

export type TodaysOpsRow = {
  bookingId: string
  bookingName: string
  eventDate: string
  eventTime: string | null
  status: string
  chefId: string | null
  chefName: string | null
}

export type OpsDashboardData = {
  range: DateRangeKey
  kpis: OpsKpis
  atRisk: AtRiskRow[]
  todaysOps: TodaysOpsRow[]
}

/**
 * Fetch KPIs and table data for the ops dashboard.
 */
export async function getOpsDashboardData(range: DateRangeKey): Promise<OpsDashboardData> {
  const { start, end } = getRangeDates(range)

  const startDateOnly = new Date(start)
  startDateOnly.setHours(0, 0, 0, 0)
  const endDateOnly = new Date(end)
  endDateOnly.setHours(23, 59, 59, 999)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setHours(23, 59, 59, 999)

  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)
  const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999)

  // Bookings in range (by eventDate)
  const bookingsInRange = await db.bookingInquiry.findMany({
    where: { eventDate: { gte: startDateOnly, lte: endDateOnly } },
    select: {
      id: true,
      name: true,
      eventDate: true,
      eventTime: true,
      status: true,
      jobCompletedAt: true,
      chefPayoutStatus: true,
      chefPayoutPaidAt: true,
      chefPayoutBonusCents: true,
      assignedChefId: true,
      chefAssignment: {
        select: {
          chefId: true,
          status: true,
          createdAt: true,
          chef: { select: { name: true } },
        },
      },
      review: { select: { rating: true } },
      chefPrepChecklist: {
        select: {
          completed: true,
          template: { select: { items: true } },
        },
      },
    },
    orderBy: { eventDate: 'asc' },
  })

  const bookingsToday =
    range === 'today'
      ? bookingsInRange.length
      : await db.bookingInquiry.count({
          where: { eventDate: { gte: todayStart, lte: todayEnd } },
        })

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 6)
  const bookingsLast7Days = await db.bookingInquiry.count({
    where: { eventDate: { gte: weekStart, lte: todayEnd } },
  })
  const bookingsWeek = bookingsLast7Days

  const withAssignment = bookingsInRange.filter((b) => b.chefAssignment)
  const completed = withAssignment.filter(
    (b) => b.chefAssignment!.status === 'COMPLETED' || b.jobCompletedAt
  )
  const completionRatePct =
    withAssignment.length === 0
      ? 0
      : Math.round((completed.length / withAssignment.length) * 100)

  let totalAssignmentHours = 0
  let assignmentCount = 0
  for (const b of completed) {
    const completedAt = b.jobCompletedAt ?? (b.chefAssignment as { updatedAt?: Date })?.updatedAt
    const createdAt = b.chefAssignment?.createdAt
    if (completedAt && createdAt) {
      totalAssignmentHours += (new Date(completedAt).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
      assignmentCount++
    }
  }
  const avgAssignmentTimeHours =
    assignmentCount === 0 ? 0 : Math.round((totalAssignmentHours / assignmentCount) * 10) / 10

  const reviewsInRange = await db.review.findMany({
    where: {
      hidden: false,
      booking: { eventDate: { gte: startDateOnly, lte: endDateOnly } },
    },
    select: { rating: true },
  })
  const avgRating =
    reviewsInRange.length === 0
      ? 0
      : Math.round((reviewsInRange.reduce((s, r) => s + r.rating, 0) / reviewsInRange.length) * 10) / 10
  const lowRatingCount = reviewsInRange.filter((r) => r.rating <= 3).length

  const activeCoachingCases = await db.coachingCase.count({
    where: { status: { not: 'CLEARED' } },
  })

  const chefIdsWithAssignment = new Set(
    (await db.chefAssignment.findMany({
      where: { booking: { eventDate: { gte: startDateOnly, lte: endDateOnly } } },
      select: { chefId: true },
    })).map((a) => a.chefId)
  )
  const activeChefs = chefIdsWithAssignment.size

  const todayDateOnly = new Date(todayStart)
  todayDateOnly.setHours(0, 0, 0, 0)
  const availableToday = await db.chefAvailability.count({
    where: { date: todayDateOnly, available: true },
  })
  const featuredChefs = await db.chefFeature.count({
    where: { featured: true },
  })

  const payoutsPending = await db.bookingInquiry.count({
    where: {
      assignedChefId: { not: null },
      chefPayoutStatus: { equals: 'pending', mode: 'insensitive' },
    },
  })
  const paidThisMonth = await db.bookingInquiry.findMany({
    where: {
      chefPayoutStatus: { equals: 'paid', mode: 'insensitive' },
      chefPayoutPaidAt: { gte: monthStart, lte: monthEnd },
    },
    select: { chefPayoutBonusCents: true },
  })
  const payoutsPaidMtd = paidThisMonth.length
  const withBonus = paidThisMonth.filter((b) => (b.chefPayoutBonusCents ?? 0) > 0).length
  const bonusPctApplied = payoutsPaidMtd === 0 ? 0 : Math.round((withBonus / payoutsPaidMtd) * 100)

  const atRisk: AtRiskRow[] = []

  for (const b of bookingsInRange) {
    const assignment = b.chefAssignment
    if (!assignment) continue
    const chefName = assignment.chef?.name ?? null
    const eventDateStr = new Date(b.eventDate).toISOString().split('T')[0]

    if (b.review && b.review.rating <= 3) {
      atRisk.push({
        bookingId: b.id,
        bookingName: b.name,
        chefId: assignment.chefId,
        chefName,
        reason: 'low_rating',
        detail: `${b.review.rating} stars`,
        eventDate: eventDateStr,
      })
    }
    const scheduled = getScheduledAt(b.eventDate, b.eventTime)
    if (b.jobCompletedAt && new Date(b.jobCompletedAt) > scheduled) {
      atRisk.push({
        bookingId: b.id,
        bookingName: b.name,
        chefId: assignment.chefId,
        chefName,
        reason: 'late',
        detail: 'Completed after scheduled time',
        eventDate: eventDateStr,
      })
    }
    const checklist = b.chefPrepChecklist
    if (checklist) {
      const template = checklist.template
      const items = (template?.items as { required?: boolean }[]) ?? []
      const requiredIndices = items.map((item, i) => (item.required ? i : -1)).filter((i) => i >= 0)
      const completedMap = (checklist.completed as Record<string, boolean>) ?? {}
      const allRequired = requiredIndices.length === 0 || requiredIndices.every((i) => completedMap[String(i)] === true)
      if (requiredIndices.length > 0 && !allRequired && (b.eventDate <= todayEnd)) {
        atRisk.push({
          bookingId: b.id,
          bookingName: b.name,
          chefId: assignment.chefId,
          chefName,
          reason: 'missed_prep',
          detail: 'Prep incomplete',
          eventDate: eventDateStr,
        })
      }
    }
  }

  const slaAtRiskRows = await getBookingsSlaAtRisk()
  const slaAtRisk: SlaAtRiskRow[] = slaAtRiskRows.map((b) => ({
    id: b.id,
    name: b.name,
    eventDate: new Date(b.eventDate).toISOString().split('T')[0],
    eventTime: b.eventTime,
    status: b.status,
    slaStatus: b.slaStatus,
    breachTypes: ((b.slaBreaches as { type: string }[] | null) ?? []).map((x) => x.type),
  }))

  const todaysOps: TodaysOpsRow[] = []
  const todayBookings = await db.bookingInquiry.findMany({
    where: { eventDate: { gte: todayStart, lte: todayEnd } },
    select: {
      id: true,
      name: true,
      eventDate: true,
      eventTime: true,
      status: true,
      chefAssignment: {
        select: { chefId: true, chef: { select: { name: true } } },
      },
    },
    orderBy: { eventTime: 'asc' },
  })
  for (const b of todayBookings) {
    todaysOps.push({
      bookingId: b.id,
      bookingName: b.name,
      eventDate: new Date(b.eventDate).toISOString().split('T')[0],
      eventTime: b.eventTime,
      status: b.status,
      chefId: b.chefAssignment?.chefId ?? null,
      chefName: b.chefAssignment?.chef?.name ?? null,
    })
  }

  return {
    range,
    kpis: {
      bookingsToday,
      bookingsWeek: bookingsLast7Days,
      completionRatePct,
      avgAssignmentTimeHours,
      avgRating,
      lowRatingCount,
      activeCoachingCases,
      activeChefs,
      availableToday,
      featuredChefs,
      payoutsPending,
      payoutsPaidMtd,
      bonusPctApplied,
    },
    atRisk: atRisk.slice(0, 50),
    todaysOps,
    slaAtRisk,
  }
}
