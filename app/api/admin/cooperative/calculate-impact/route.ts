import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { calculateAllMemberImpactScores } from '@/lib/cooperative-impact-calculator'

/**
 * Phase 7A: Calculate impact scores for all members
 * POST /api/admin/cooperative/calculate-impact
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const result = await calculateAllMemberImpactScores()

    if (result.success) {
      return NextResponse.json({
        success: true,
        members_updated: result.members_updated,
        errors: result.errors.length > 0 ? result.errors : undefined,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.errors.join(', ') || 'Failed to calculate impact scores' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error calculating impact scores:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate impact scores' },
      { status: 500 }
    )
  }
}
