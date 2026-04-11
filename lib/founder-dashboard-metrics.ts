import { db } from '@/lib/db'

/**
 * Founder Dashboard — 5 metrics that drive revenue.
 * All values are computed from Prisma models only; missing data returns 0.
 */

export interface FounderDashboardMetrics {
  /** Total paid revenue this calendar month, in dollars (Academy + Sportswear + Provisions). */
  revenueThisMonthDollars: number
  /** Count of new leads in the last 7 days (BookingInquiry + EmailSubscriber + Farmer). */
  leadsThisWeek: number
  /** Total EmailSubscriber count. */
  emailSubscribers: number
  /** EmailSubscriber records created in the last 30 days (for subtext). */
  emailSubscribersLast30Days: number
  /** Count of conversion events this month (Academy purchase + enrollment, Sportswear paid, Provisions confirmed/paid). */
  conversionActionsThisMonth: number
  /** Sum of estimated value of open pipeline opportunities, in dollars. */
  activePipelineValueDollars: number
}

/** Statuses we treat as "open" for pipeline value (not cancelled/completed). */
const OPEN_BOOKING_STATUSES = ['New', 'Quote Sent', 'Follow Up', 'quote_sent', 'follow_up', 'Confirmed']

export async function getFounderDashboardMetrics(): Promise<FounderDashboardMetrics> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Batched (not one giant Promise.all) to avoid exhausting Supabase session pool / max clients.
  const [
    academyRevenueCents,
    sportswearRevenueCents,
    provisionsRevenueCents,
    leadsBookingInquiry,
    leadsEmailSubscriber,
  ] = await Promise.all([
    db.academyPurchase.aggregate({
      where: { purchasedAt: { gte: startOfMonth } },
      _sum: { productPrice: true },
    }),
    db.sportswearOrder.aggregate({
      where: { paidAt: { gte: startOfMonth, not: null } },
      _sum: { totalCents: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        AND: [
          { OR: [{ paidAt: { gte: startOfMonth } }, { fullyPaidAt: { gte: startOfMonth } }] },
          { OR: [{ totalCents: { gt: 0 } }, { quoteTotalCents: { gt: 0 } }] },
        ],
      },
      select: { totalCents: true, quoteTotalCents: true },
    }),
    db.bookingInquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.emailSubscriber.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ])

  const [leadsFarmer, emailSubscriberTotal, emailSubscriberLast30, conversionAcademyPurchase, conversionAcademyEnrollment] =
    await Promise.all([
      db.farmer.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.emailSubscriber.count(),
      db.emailSubscriber.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.academyPurchase.count({ where: { purchasedAt: { gte: startOfMonth } } }),
      db.academyEnrollment.count({ where: { enrolledAt: { gte: startOfMonth } } }),
    ])

  const [conversionSportswear, conversionProvisions, pipelineBookings] = await Promise.all([
    db.sportswearOrder.count({
      where: { paidAt: { gte: startOfMonth, not: null } },
    }),
    db.bookingInquiry.count({
      where: {
        OR: [{ paidAt: { gte: startOfMonth } }, { fullyPaidAt: { gte: startOfMonth } }],
        status: { notIn: ['cancelled', 'completed', 'Cancelled', 'Completed'] },
      },
    }),
    db.bookingInquiry.findMany({
      where: {
        status: { in: OPEN_BOOKING_STATUSES },
        OR: [{ quoteTotalCents: { gt: 0 } }, { totalCents: { gt: 0 } }],
      },
      select: { quoteTotalCents: true, totalCents: true },
    }),
  ])

  // Provisions revenue: sum (totalCents ?? quoteTotalCents ?? 0) for records that had paid this month
  const provisionsCents = provisionsRevenueCents.reduce(
    (sum, row) => sum + (row.totalCents ?? row.quoteTotalCents ?? 0),
    0
  )

  const revenueCents =
    (academyRevenueCents._sum.productPrice ?? 0) +
    (sportswearRevenueCents._sum.totalCents ?? 0) +
    provisionsCents

  const pipelineCents = pipelineBookings.reduce(
    (sum, row) => sum + (row.quoteTotalCents ?? row.totalCents ?? 0),
    0
  )

  return {
    revenueThisMonthDollars: Math.round(revenueCents) / 100,
    leadsThisWeek:
      (leadsBookingInquiry ?? 0) + (leadsEmailSubscriber ?? 0) + (leadsFarmer ?? 0),
    emailSubscribers: emailSubscriberTotal ?? 0,
    emailSubscribersLast30Days: emailSubscriberLast30 ?? 0,
    conversionActionsThisMonth:
      (conversionAcademyPurchase ?? 0) +
      (conversionAcademyEnrollment ?? 0) +
      (conversionSportswear ?? 0) +
      (conversionProvisions ?? 0),
    activePipelineValueDollars: Math.round(pipelineCents) / 100,
  }
}
