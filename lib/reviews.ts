/**
 * Phase 2U — Client reviews (verified, one per completed booking).
 */

import { db } from '@/lib/db'

export type ReviewWithBooking = {
  id: string
  bookingId: string
  chefId: string
  rating: number
  comment: string | null
  hidden: boolean
  createdAt: Date
}

/**
 * Check if a booking can accept a review (COMPLETED, has chef, no review yet).
 */
export async function canSubmitReview(bookingId: string): Promise<{
  allowed: boolean
  chefId?: string
  reason?: string
}> {
  const assignment = await db.chefAssignment.findUnique({
    where: { bookingId },
    select: { status: true, chefId: true },
  })
  if (!assignment) {
    return { allowed: false, reason: 'No chef assigned' }
  }
  if (assignment.status !== 'COMPLETED') {
    return { allowed: false, reason: 'Booking not yet completed' }
  }
  const existing = await db.review.findUnique({
    where: { bookingId },
    select: { id: true },
  })
  if (existing) {
    return { allowed: false, reason: 'Already reviewed' }
  }
  return { allowed: true, chefId: assignment.chefId }
}

/**
 * Get reviews for a chef (public: hidden = false; admin can pass includeHidden).
 */
export async function getReviewsForChef(
  chefId: string,
  options: { includeHidden?: boolean; limit?: number } = {}
): Promise<ReviewWithBooking[]> {
  const { includeHidden = false, limit = 50 } = options
  const list = await db.review.findMany({
    where: {
      chefId,
      ...(includeHidden ? {} : { hidden: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return list
}

/**
 * Get aggregate stats for a chef (average rating, count). Excludes hidden.
 */
export async function getReviewStatsForChef(chefId: string): Promise<{
  averageRating: number
  count: number
}> {
  const list = await db.review.findMany({
    where: { chefId, hidden: false },
    select: { rating: true },
  })
  if (list.length === 0) {
    return { averageRating: 0, count: 0 }
  }
  const sum = list.reduce((s, r) => s + r.rating, 0)
  return {
    averageRating: Math.round((sum / list.length) * 10) / 10, // 1 decimal
    count: list.length,
  }
}

/**
 * Check if booking already has a review (for portal display).
 */
export async function hasReviewForBooking(bookingId: string): Promise<boolean> {
  const r = await db.review.findUnique({
    where: { bookingId },
    select: { id: true },
  })
  return !!r
}
