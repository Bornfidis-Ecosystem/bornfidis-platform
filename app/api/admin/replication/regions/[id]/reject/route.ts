export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 7B: Reject replication region
 * POST /api/admin/replication/regions/[id]/reject
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const regionId = params.id

    const body = await request.json()
    const { reason } = body

    // Update region status
    const { error } = await supabaseAdmin
      .from('replication_regions')
      .update({
        status: 'inquiry', // Keep as inquiry but mark as rejected
        rejection_reason: reason || null,
      })
      .eq('id', regionId)

    if (error) {
      console.error('Error rejecting region:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to reject region' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Region rejected',
    })
  } catch (error: any) {
    console.error('Error rejecting region:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject region' },
      { status: 500 }
    )
  }
}
