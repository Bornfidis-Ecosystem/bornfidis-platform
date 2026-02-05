export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 7B: Approve replication region
 * POST /api/admin/replication/regions/[id]/approve
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const regionId = params.id

    // Update region status
    const { error } = await supabaseAdmin
      .from('replication_regions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', regionId)

    if (error) {
      console.error('Error approving region:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to approve region' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Region approved successfully',
    })
  } catch (error: any) {
    console.error('Error approving region:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve region' },
      { status: 500 }
    )
  }
}
