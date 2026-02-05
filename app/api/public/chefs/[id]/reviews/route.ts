export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getReviewsForChef, getReviewStatsForChef } from '@/lib/reviews'

/**
 * Phase 2U — Public chef reviews (verified, non-hidden only).
 * GET /api/public/chefs/[id]/reviews
 * Query: limit (default 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chefId = params.id
    if (!chefId) {
      return NextResponse.json(
        { success: false, error: 'Chef ID is required' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 50)

    const [stats, reviews] = await Promise.all([
      getReviewStatsForChef(chefId),
      getReviewsForChef(chefId, { includeHidden: false, limit }),
    ])

    return NextResponse.json({
      stats: { averageRating: stats.averageRating, count: stats.count },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    })
  } catch (e) {
    console.error('Public chef reviews error:', e)
    return NextResponse.json(
      { error: 'Failed to load reviews' },
      { status: 500 }
    )
  }
}
