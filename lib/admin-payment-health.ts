import { db } from '@/lib/db'

export type AdminPaymentHealth = {
  weekStartIso: string
  /** Rolling 7-day window (aligned with other admin metrics). */
  depositsReceivedCount: number
  depositsReceivedCents: number
  balancesReceivedCount: number
  balancesReceivedCents: number
  pendingDepositsCount: number
  pendingBalancesCount: number
}

function weekStartRolling(): Date {
  const now = new Date()
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
}

/**
 * Aggregates for the founder /admin payment health strip.
 * Uses the same rolling 7-day window as `getAdminDashboardMetrics` weekly stats.
 */
export async function getAdminPaymentHealth(): Promise<AdminPaymentHealth> {
  const weekStart = weekStartRolling()

  const [paidThisWeek, balancedThisWeek, pendingDepositRows, balanceCandidates] = await Promise.all([
    db.bookingInquiry.findMany({
      where: { paidAt: { gte: weekStart } },
      select: { depositAmountCents: true },
    }),
    db.bookingInquiry.findMany({
      where: { balancePaidAt: { gte: weekStart } },
      select: { balanceAmountCents: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        paidAt: null,
        quoteTotalCents: { gt: 0 },
      },
      select: { id: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        paidAt: { not: null },
        balancePaidAt: null,
        quoteTotalCents: { gt: 0 },
      },
      select: {
        id: true,
        quoteTotalCents: true,
        depositAmountCents: true,
        balanceAmountCents: true,
      },
    }),
  ])

  const pendingBalancesCount = balanceCandidates.filter((b) => {
    const stored = b.balanceAmountCents ?? 0
    if (stored > 0) return true
    const q = b.quoteTotalCents ?? 0
    const dep = b.depositAmountCents ?? 0
    return q > dep
  }).length

  return {
    weekStartIso: weekStart.toISOString(),
    depositsReceivedCount: paidThisWeek.length,
    depositsReceivedCents: paidThisWeek.reduce((s, r) => s + (r.depositAmountCents ?? 0), 0),
    balancesReceivedCount: balancedThisWeek.length,
    balancesReceivedCents: balancedThisWeek.reduce((s, r) => s + (r.balanceAmountCents ?? 0), 0),
    pendingDepositsCount: pendingDepositRows.length,
    pendingBalancesCount,
  }
}

export type LastStripeActivityInfo = {
  stripeEventId: string
  type: string
  title: string
  createdAt: string
} | null

/**
 * Latest booking activity row that was tied to a Stripe webhook (`stripe_event_id` set).
 */
export async function getLastStripeActivityForBooking(bookingId: string): Promise<LastStripeActivityInfo> {
  const row = await db.bookingActivity.findFirst({
    where: { bookingId, stripeEventId: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { stripeEventId: true, type: true, title: true, createdAt: true },
  })
  if (!row?.stripeEventId) return null
  return {
    stripeEventId: row.stripeEventId,
    type: row.type,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
  }
}
