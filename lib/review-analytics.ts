/**
 * Phase 2W — Review analytics (no new schema).
 * Avg rating, count, trend (30/90 days), low-rating flags (≤3⭐).
 */

import { db } from '@/lib/db'

const LOW_RATING_THRESHOLD = 3

export type ReviewSummaryForChef = {
  averageRating: number
  count: number
  flaggedCount: number
  lowRatingPercent: number
  /** Avg rating in last 30 days (null if none) */
  trendAvgLast30: number | null
  /** Avg rating in last 90 days (null if none) */
  trendAvgLast90: number | null
}

export type ChefReviewRow = {
  chefId: string
  chefName: string
  averageRating: number
  count: number
  flaggedCount: number
  lowRatingPercent: number
}

export type AdminReviewAnalytics = {
  summary: {
    totalReviews: number
    avgRating: number
    lowRatingPercent: number
    flaggedCount: number
  }
  chefs: ChefReviewRow[]
}

/**
 * Get review summary for one chef (for chef performance page).
 * Excludes hidden reviews.
 */
export async function getReviewSummaryForChef(chefId: string): Promise<ReviewSummaryForChef> {
  const now = new Date()
  const day30 = new Date(now)
  day30.setDate(day30.getDate() - 30)
  const day90 = new Date(now)
  day90.setDate(day90.getDate() - 90)

  const reviews = await db.review.findMany({
    where: { chefId, hidden: false },
    select: { rating: true, createdAt: true },
  })

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      count: 0,
      flaggedCount: 0,
      lowRatingPercent: 0,
      trendAvgLast30: null,
      trendAvgLast90: null,
    }
  }

  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  const averageRating = Math.round((sum / reviews.length) * 10) / 10
  const flaggedCount = reviews.filter((r) => r.rating <= LOW_RATING_THRESHOLD).length
  const lowRatingPercent = Math.round((flaggedCount / reviews.length) * 100)

  const last30 = reviews.filter((r) => new Date(r.createdAt) >= day30)
  const last90 = reviews.filter((r) => new Date(r.createdAt) >= day90)
  const trendAvgLast30 =
    last30.length > 0
      ? Math.round((last30.reduce((s, r) => s + r.rating, 0) / last30.length) * 10) / 10
      : null
  const trendAvgLast90 =
    last90.length > 0
      ? Math.round((last90.reduce((s, r) => s + r.rating, 0) / last90.length) * 10) / 10
      : null

  return {
    averageRating,
    count: reviews.length,
    flaggedCount,
    lowRatingPercent,
    trendAvgLast30,
    trendAvgLast90,
  }
}

/**
 * Get analytics for admin: global summary + per-chef table.
 * Excludes hidden reviews.
 */
export async function getAdminReviewAnalytics(): Promise<AdminReviewAnalytics> {
  const reviews = await db.review.findMany({
    where: { hidden: false },
    select: { id: true, chefId: true, rating: true },
  })

  const chefIds = [...new Set(reviews.map((r) => r.chefId))]
  const users =
    chefIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: chefIds } },
          select: { id: true, name: true, email: true },
        })
      : []
  const nameByChefId = new Map(users.map((u) => [u.id, u.name || u.email || u.id]))

  const byChef = new Map<
    string,
    { sum: number; count: number; flagged: number }
  >()
  for (const r of reviews) {
    const cur = byChef.get(r.chefId) ?? { sum: 0, count: 0, flagged: 0 }
    cur.sum += r.rating
    cur.count += 1
    if (r.rating <= LOW_RATING_THRESHOLD) cur.flagged += 1
    byChef.set(r.chefId, cur)
  }

  const totalReviews = reviews.length
  const totalSum = reviews.reduce((s, r) => s + r.rating, 0)
  const totalFlagged = reviews.filter((r) => r.rating <= LOW_RATING_THRESHOLD).length

  const chefs: ChefReviewRow[] = Array.from(byChef.entries()).map(([chefId, data]) => ({
    chefId,
    chefName: nameByChefId.get(chefId) ?? 'Unknown',
    averageRating: Math.round((data.sum / data.count) * 10) / 10,
    count: data.count,
    flaggedCount: data.flagged,
    lowRatingPercent: Math.round((data.flagged / data.count) * 100),
  }))

  // Sort by count desc, then by avg rating desc
  chefs.sort((a, b) => b.count - a.count || b.averageRating - a.averageRating)

  return {
    summary: {
      totalReviews,
      avgRating: totalReviews > 0 ? Math.round((totalSum / totalReviews) * 10) / 10 : 0,
      lowRatingPercent: totalReviews > 0 ? Math.round((totalFlagged / totalReviews) * 100) : 0,
      flaggedCount: totalFlagged,
    },
    chefs,
  }
}

/**
 * Trend by month for a chef (for optional display).
 * Returns last N days grouped by month: { monthKey, avgRating, count }.
 */
export async function getReviewTrendByMonth(
  chefId: string,
  lastNDays: number = 90
): Promise<Array<{ monthKey: string; avgRating: number; count: number }>> {
  const since = new Date()
  since.setDate(since.getDate() - lastNDays)

  const reviews = await db.review.findMany({
    where: { chefId, hidden: false, createdAt: { gte: since } },
    select: { rating: true, createdAt: true },
  })

  const byMonth = new Map<string, { sum: number; count: number }>()
  for (const r of reviews) {
    const d = new Date(r.createdAt)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const cur = byMonth.get(key) ?? { sum: 0, count: 0 }
    cur.sum += r.rating
    cur.count += 1
    byMonth.set(key, cur)
  }

  return Array.from(byMonth.entries())
    .map(([monthKey, data]) => ({
      monthKey,
      avgRating: Math.round((data.sum / data.count) * 10) / 10,
      count: data.count,
    }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
}
