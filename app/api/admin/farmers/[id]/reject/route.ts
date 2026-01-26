import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6A: Reject farmer application
 * POST /api/admin/farmers/[id]/reject
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const farmerId = params.id

    const body = await request.json()
    const { reason } = body

    // Update farmer status to inactive (we don't have 'rejected' status)
    const { error } = await supabaseAdmin
      .from('farmers')
      .update({
        status: 'inactive',
        rejection_reason: reason || null,
      })
      .eq('id', farmerId)

    if (error) {
      console.error('Error rejecting farmer:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to reject farmer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Farmer application rejected',
    })
  } catch (error: any) {
    console.error('Error rejecting farmer:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject farmer' },
      { status: 500 }
    )
  }
}
