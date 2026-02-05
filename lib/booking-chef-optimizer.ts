/**
 * Phase 2AD — Admin Scheduling Optimizer.
 * Hard filters: available (day + time slot), no conflict.
 * Soft score: Tier 40%, Performance 40%, Workload balance 20%. Top 3. No auto-assign.
 */

import { db } from '@/lib/db'
import { ChefTier } from '@prisma/client'
import { checkChefAvailableForDateTime } from '@/lib/chef-time-slots'
import { getEffectiveTier, getTierLabel } from '@/lib/chef-tier'
import { getChefPerformanceMetrics } from '@/lib/chef-performance'
import { getReviewStatsForChef } from '@/lib/reviews'

const TIER_WEIGHT = 0.4
const PERF_WEIGHT = 0.4
const WORKLOAD_WEIGHT = 0.2
const TOP_N = 3

const TIER_ORDER: Record<ChefTier, number> = {
  ELITE: 3,
  PRO: 2,
  STANDARD: 1,
}

export type RecommendedChef = {
  id: string
  name: string
  tier: ChefTier
  tierLabel: string
  /** 0–100 composite (transparent for admin). */
  score: number
  /** Last / avg rating (e.g. 4.8). */
  lastRating: number | null
  /** On-time % (last jobs). */
  onTimePercent: number | null
  /** Prep completion % (last jobs). */
  prepPercent: number | null
  /** Assignments in next 30 days from event date (workload). */
  workloadInNext30: number
  /** Always "Available" when in list (hard filter passed). */
  availabilityStatus: string
}

export type GetRecommendedChefsResult = {
  recommendations: RecommendedChef[]
  /** Set when zero eligible chefs. */
  warning?: string
}

/**
 * Count assignments for chef in [fromDate, fromDate+30 days].
 */
async function countAssignmentsInNext30(chefId: string, fromDate: Date): Promise<number> {
  const start = new Date(fromDate)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 30)
  const n = await db.chefAssignment.count({
    where: {
      chefId,
      booking: { eventDate: { gte: start, lt: end } },
    },
  })
  return n
}

/**
 * Tier → 0–100 (Elite=100, Pro≈67, Standard≈33).
 */
function tierToScore(tier: ChefTier): number {
  const ord = TIER_ORDER[tier] ?? 1
  return Math.round((ord / 3) * 100)
}

/**
 * Performance: rating (1–5) + on-time % + prep % → 0–100.
 */
function perfToScore(
  avgRating: number,
  onTimePercent: number | null,
  prepPercent: number | null
): number {
  const ratingNorm = (avgRating / 5) * 40
  const onTimeNorm = (onTimePercent ?? 0) / 100 * 30
  const prepNorm = (prepPercent ?? 0) / 100 * 30
  return Math.round(ratingNorm + onTimeNorm + prepNorm)
}

/**
 * Workload: fewer jobs in next 30 days = higher. 0 jobs = 100, 20+ = 0.
 */
function workloadToScore(assignmentsInNext30: number): number {
  return Math.max(0, Math.min(100, 100 - 5 * assignmentsInNext30))
}

/**
 * Get top 3 recommended chefs for a booking (event date + time).
 * Candidate list is pre-filtered (e.g. active chefs from Supabase). Hard filters: available, no conflict.
 */
export async function getRecommendedChefs(
  eventDate: Date,
  eventTime: string | null,
  candidateChefs: Array<{ id: string; name: string }>
): Promise<GetRecommendedChefsResult> {
  if (candidateChefs.length === 0) {
    return { recommendations: [], warning: 'No chefs to consider.' }
  }

  const eligible: Array<{
    id: string
    name: string
    tier: ChefTier
    tierLabel: string
    tierScore: number
    perfScore: number
    workloadScore: number
    lastRating: number | null
    onTimePercent: number | null
    prepPercent: number | null
    workloadInNext30: number
  }> = []

  for (const chef of candidateChefs) {
    const availability = await checkChefAvailableForDateTime(
      chef.id,
      eventDate,
      eventTime?.trim() || null,
      { adminOverride: false }
    )
    if (!availability.allowed) continue

    const [tier, metrics, reviewStats, workloadInNext30] = await Promise.all([
      getEffectiveTier(chef.id),
      getChefPerformanceMetrics(chef.id, { lastJobsLimit: 1 }),
      getReviewStatsForChef(chef.id),
      countAssignmentsInNext30(chef.id, eventDate),
    ])
    const tierLabel = getTierLabel(tier) || 'Standard Chef'
    const tierScore = tierToScore(tier)
    const perfScore = perfToScore(
      reviewStats.averageRating,
      metrics.onTimeRatePercent,
      metrics.prepCompletionRatePercent
    )
    const workloadScore = workloadToScore(workloadInNext30)
    const composite = TIER_WEIGHT * tierScore + PERF_WEIGHT * perfScore + WORKLOAD_WEIGHT * workloadScore

    eligible.push({
      id: chef.id,
      name: chef.name,
      tier,
      tierLabel,
      tierScore,
      perfScore,
      workloadScore,
      lastRating: reviewStats.count > 0 ? reviewStats.averageRating : null,
      onTimePercent: metrics.onTimeRatePercent,
      prepPercent: metrics.prepCompletionRatePercent,
      workloadInNext30,
    })
  }

  eligible.sort((a, b) => {
    const scoreA = TIER_WEIGHT * a.tierScore + PERF_WEIGHT * a.perfScore + WORKLOAD_WEIGHT * a.workloadScore
    const scoreB = TIER_WEIGHT * b.tierScore + PERF_WEIGHT * b.perfScore + WORKLOAD_WEIGHT * b.workloadScore
    return scoreB - scoreA
  })

  const top = eligible.slice(0, TOP_N)
  const recommendations: RecommendedChef[] = top.map((e) => ({
    id: e.id,
    name: e.name,
    tier: e.tier,
    tierLabel: e.tierLabel,
    score: Math.round(composite(e)),
    lastRating: e.lastRating,
    onTimePercent: e.onTimePercent,
    prepPercent: e.prepPercent,
    workloadInNext30: e.workloadInNext30,
    availabilityStatus: 'Available',
  }))

  const warning =
    eligible.length === 0
      ? 'No chefs are available for this date & time. Use override to assign anyway.'
      : undefined

  return { recommendations, warning }
}
