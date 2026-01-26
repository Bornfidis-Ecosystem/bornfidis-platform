import { NextRequest, NextResponse } from 'next/server'
import { getActiveChefs } from '@/app/admin/chefs/actions'

/**
 * Phase 5A: Get active chefs (for assignment dropdown)
 * GET /api/admin/chefs/active
 */
export async function GET(request: NextRequest) {
  try {
    const result = await getActiveChefs()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      chefs: result.chefs,
    })
  } catch (error: any) {
    console.error('Error fetching active chefs:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chefs' },
      { status: 500 }
    )
  }
}
