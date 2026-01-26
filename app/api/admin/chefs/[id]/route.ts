import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getChefById } from '../../chefs/actions'

/**
 * Phase 5B: Get chef by ID
 * GET /api/admin/chefs/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const result = await getChefById(params.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Chef not found' ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      chef: result.chef,
    })
  } catch (error: any) {
    console.error('Error fetching chef:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chef' },
      { status: 500 }
    )
  }
}
