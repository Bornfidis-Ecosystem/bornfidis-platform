/**
 * Phase 2X — Featured Chefs
 * Eligibility: avg ≥ 4.7, Certified Chef + On-Time Pro badges, no low-rating flags. Max 5. Admin can override.
 */

import { db } from '@/lib/db'
import { getReviewSummaryForChef } from '@/lib/review-analytics'
import { getPublicEarnedBadgesForChef } from '@/lib/badges'

const FEATURED_MIN_RATING = 4.7
const FEATURED_MAX_COUNT = 5
const REQUIRED_BADGES = ['Certified Chef', 'On-Time Pro']

export type FeaturedEligibility = {
  eligible: boolean
  reason?: string
  hasRating: boolean
  hasCertifiedChef: boolean
  hasOnTimePro: boolean
  noLowRatingFlags: boolean
  averageRating: number
  reviewCount: number
  flaggedCount: number
}

/**
 * Check if a chef is eligible to be featured (v1 criteria).
 * No active low-rating flags = 0 reviews with rating ≤ 3 (or 0% low-rating).
 */
export async function isEligibleForFeatured(chefId: string): Promise<FeaturedEligibility> {
  const [badges, summary] = await Promise.all([
    getPublicEarnedBadgesForChef(chefId),
    getReviewSummaryForChef(chefId),
  ])
  const badgeNames = badges.map((b) => b.name)
  const hasCertifiedChef = badgeNames.includes('Certified Chef')
  const hasOnTimePro = badgeNames.includes('On-Time Pro')
  const hasRating = summary.count >= 1 && summary.averageRating >= FEATURED_MIN_RATING
  const noLowRatingFlags = summary.flaggedCount === 0

  const eligible =
    hasCertifiedChef &&
    hasOnTimePro &&
    hasRating &&
    noLowRatingFlags

  let reason: string | undefined
  if (!hasCertifiedChef) reason = 'Missing Certified Chef badge'
  else if (!hasOnTimePro) reason = 'Missing On-Time Pro badge'
  else if (summary.count < 1) reason = 'No reviews yet'
  else if (summary.averageRating < FEATURED_MIN_RATING) reason = `Rating ${summary.averageRating.toFixed(1)} < ${FEATURED_MIN_RATING}`
  else if (!noLowRatingFlags) reason = 'Has low-rating flags (≤3★)'

  return {
    eligible: !!eligible,
    reason,
    hasRating,
    hasCertifiedChef,
    hasOnTimePro,
    noLowRatingFlags,
    averageRating: summary.averageRating,
    reviewCount: summary.count,
    flaggedCount: summary.flaggedCount,
  }
}

/**
 * Get chef IDs that are featured (from DB). Does not filter by eligibility; use getFeaturedChefIdsForDisplay for display.
 */
export async function getFeaturedChefIds(): Promise<string[]> {
  const rows = await db.chefFeature.findMany({
    where: { featured: true },
    select: { chefId: true },
  })
  return rows.map((r) => r.chefId)
}

/**
 * Get featured chef IDs for public/admin display: featured=true and (eligible OR adminOverride), max 5.
 * Order: featured first (by tier/rating if we have it), then cap at 5.
 */
export async function getFeaturedChefIdsForDisplay(): Promise<string[]> {
  const rows = await db.chefFeature.findMany({
    where: { featured: true },
    select: { chefId: true, adminOverride: true },
  })
  if (rows.length === 0) return []

  const withEligible: Array<{ chefId: string; adminOverride: boolean; eligible: boolean }> = []
  for (const r of rows) {
    const eligibility = await isEligibleForFeatured(r.chefId)
    withEligible.push({
      chefId: r.chefId,
      adminOverride: r.adminOverride,
      eligible: eligibility.eligible,
    })
  }

  const allowed = withEligible.filter((x) => x.eligible || x.adminOverride)
  return allowed.slice(0, FEATURED_MAX_COUNT).map((x) => x.chefId)
}

/**
 * Set featured flag for a chef. Enforces max 5; with adminOverride can feature ineligible chefs.
 */
export async function setChefFeatured(
  chefId: string,
  featured: boolean,
  adminOverride: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await db.chefFeature.findUnique({
      where: { chefId },
    })
    const featuredCount = await db.chefFeature.count({ where: { featured: true } })

    if (featured) {
      if (!current?.featured && featuredCount >= FEATURED_MAX_COUNT) {
        // Unfeature one: pick first without adminOverride (so we make room)
        const toUnfeature = await db.chefFeature.findFirst({
          where: { featured: true, adminOverride: false },
        })
        if (toUnfeature) {
          await db.chefFeature.update({
            where: { chefId: toUnfeature.chefId },
            data: { featured: false },
          })
        } else {
          return { success: false, error: `Max ${FEATURED_MAX_COUNT} featured chefs; all have admin override. Unfeature one first.` }
        }
      }
      await db.chefFeature.upsert({
        where: { chefId },
        create: { chefId, featured: true, adminOverride },
        update: { featured: true, adminOverride },
      })
    } else {
      if (current) {
        await db.chefFeature.update({
          where: { chefId },
          data: { featured: false, adminOverride: false },
        })
      }
    }
    return { success: true }
  } catch (e: any) {
    console.error('setChefFeatured:', e)
    return { success: false, error: e.message || 'Failed to update' }
  }
}

/**
 * Get featured status and eligibility for a chef (for admin UI).
 */
export async function getChefFeaturedStatus(chefId: string): Promise<{
  featured: boolean
  adminOverride: boolean
  eligibility: FeaturedEligibility
}> {
  const [row, eligibility] = await Promise.all([
    db.chefFeature.findUnique({ where: { chefId }, select: { featured: true, adminOverride: true } }),
    isEligibleForFeatured(chefId),
  ])
  return {
    featured: row?.featured ?? false,
    adminOverride: row?.adminOverride ?? false,
    eligibility,
  }
}

/**
 * Remove featured from chefs who are no longer eligible (and not admin override). Call from cron or manually.
 */
export async function removeIneligibleFeatured(): Promise<{ removed: string[] }> {
  const rows = await db.chefFeature.findMany({
    where: { featured: true, adminOverride: false },
    select: { chefId: true },
  })
  const removed: string[] = []
  for (const r of rows) {
    const eligibility = await isEligibleForFeatured(r.chefId)
    if (!eligibility.eligible) {
      await db.chefFeature.update({
        where: { chefId: r.chefId },
        data: { featured: false },
      })
      removed.push(r.chefId)
    }
  }
  return { removed }
}
