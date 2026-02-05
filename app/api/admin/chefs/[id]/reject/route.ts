export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5A: Reject chef application
 * POST /api/admin/chefs/[id]/reject
 * 
 * Rejects chef application with optional reason
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const chefId = params.id

    if (!chefId) {
      return NextResponse.json(
        { success: false, error: 'Chef ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const rejectionReason = body.reason || null

    // Fetch chef
    const { data: chef, error: fetchError } = await supabaseAdmin
      .from('chefs')
      .select('id, status')
      .eq('id', chefId)
      .single()

    if (fetchError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    if (chef.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Chef is already ${chef.status}` },
        { status: 400 }
      )
    }

    // Update chef status
    const { error: updateError } = await supabaseAdmin
      .from('chefs')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
      })
      .eq('id', chefId)

    if (updateError) {
      console.error('Error updating chef:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update chef status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Chef application rejected',
    })
  } catch (error: any) {
    console.error('Error rejecting chef:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject chef' },
      { status: 500 }
    )
  }
}
