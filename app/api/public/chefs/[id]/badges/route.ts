export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPublicEarnedBadgesForChef } from '@/lib/badges'

/**
 * Phase 2R — Client-facing trust badges (read-only, no auth).
 * GET /api/public/chefs/[id]/badges
 *
 * Returns earned public badges only: Certified Chef, On-Time Pro, Prep Perfect.
 * Max 3 items. No dates or metrics. Revoked badges disappear immediately.
 */
export async function GET(
  _request: NextRequest,
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

    const badges = await getPublicEarnedBadgesForChef(chefId)

    return NextResponse.json(badges)
  } catch (error: any) {
    console.error('Error fetching public chef badges:', error)
    return NextResponse.json(
      { error: 'Failed to load badges' },
      { status: 500 }
    )
  }
}
