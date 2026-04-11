import { db } from '@/lib/db'
import { PIPELINE_COLUMNS, getColumnIdForStatus } from '@/lib/provisions-pipeline'

/** Revenue in cents per division for a period */
export interface RevenuePeriod {
  totalCents: number
  academyCents: number
  provisionsCents: number
  sportswearCents: number
}

/** Funnel stage count and optional conversion from previous stage */
export interface FunnelStage {
  id: string
  label: string
  count: number
  conversionFromPrevious?: number // percentage 0–100
}

/** One week in the email growth series */
export interface EmailGrowthWeek {
  weekStart: string // YYYY-MM-DD
  weekLabel: string // e.g. "Jan 6"
  count: number // new subscribers that week
  cumulative?: number // optional running total
}

export interface FounderDashboardTrends {
  revenueTrend: {
    last30Days: RevenuePeriod
    last90Days: RevenuePeriod
  }
  provisionsFunnel: FunnelStage[]
  emailGrowth: EmailGrowthWeek[]
}

/**
 * Revenue for a date range: Academy (productPrice), Sportswear (totalCents where paidAt in range), Provisions (booking paidAt/fullyPaidAt in range, sum totalCents or quoteTotalCents).
 */
async function getRevenueForPeriod(start: Date, end: Date): Promise<RevenuePeriod> {
  const [academy, sportswear, provisions] = await Promise.all([
    db.academyPurchase.aggregate({
      where: { purchasedAt: { gte: start, lte: end } },
      _sum: { productPrice: true },
    }),
    db.sportswearOrder.aggregate({
      where: { paidAt: { gte: start, lte: end, not: null } },
      _sum: { totalCents: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        OR: [
          { paidAt: { gte: start, lte: end } },
          { fullyPaidAt: { gte: start, lte: end } },
        ],
      },
      select: { totalCents: true, quoteTotalCents: true },
    }),
  ])

  const academyCents = academy._sum.productPrice ?? 0
  const sportswearCents = sportswear._sum.totalCents ?? 0
  const provisionsCents = provisions.reduce(
    (sum, row) => sum + (row.totalCents ?? row.quoteTotalCents ?? 0),
    0
  )

  return {
    totalCents: academyCents + sportswearCents + provisionsCents,
    academyCents,
    provisionsCents,
    sportswearCents,
  }
}

/**
 * Provisions funnel: count BookingInquiry per pipeline column; conversion % = (this stage / previous stage) * 100.
 */
async function getProvisionsFunnel(): Promise<FunnelStage[]> {
  const all = await db.bookingInquiry.findMany({
    select: { status: true },
  })

  const byColumn: Record<string, number> = {}
  for (const col of PIPELINE_COLUMNS) {
    byColumn[col.id] = 0
  }
  for (const b of all) {
    const colId = getColumnIdForStatus(b.status)
    byColumn[colId] = (byColumn[colId] ?? 0) + 1
  }

  const stages: FunnelStage[] = []
  let previousCount = 0
  for (const col of PIPELINE_COLUMNS) {
    const count = byColumn[col.id] ?? 0
    const conversionFromPrevious =
      previousCount > 0 ? Math.round((count / previousCount) * 100) : undefined
    stages.push({
      id: col.id,
      label: col.label,
      count,
      conversionFromPrevious,
    })
    previousCount = count
  }

  return stages
}

/**
 * Email growth by week: count EmailSubscriber where createdAt falls in each of the last 8 weeks (week start = Monday).
 */
function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0)
}

async function getEmailGrowth(): Promise<EmailGrowthWeek[]> {
  const now = new Date()
  const weeks: EmailGrowthWeek[] = []
  let cumulative = 0

  for (let i = 7; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(end.getDate() - i * 7)
    const weekStart = startOfWeek(end)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const count = await db.emailSubscriber.count({
      where: {
        createdAt: { gte: weekStart, lt: weekEnd },
      },
    })
    cumulative += count
    weeks.push({
      weekStart: weekStart.toISOString().slice(0, 10),
      weekLabel: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
      cumulative,
    })
  }

  return weeks
}

export async function getFounderDashboardTrends(): Promise<FounderDashboardTrends> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [last30Days, last90Days, provisionsFunnel, emailGrowth] = await Promise.all([
    getRevenueForPeriod(thirtyDaysAgo, now),
    getRevenueForPeriod(ninetyDaysAgo, now),
    getProvisionsFunnel(),
    getEmailGrowth(),
  ])

  return {
    revenueTrend: {
      last30Days,
      last90Days,
    },
    provisionsFunnel,
    emailGrowth,
  }
}
