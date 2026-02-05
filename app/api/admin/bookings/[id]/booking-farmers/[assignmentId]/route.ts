export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6A: Remove farmer assignment
 * DELETE /api/admin/bookings/[id]/booking-farmers/[assignmentId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    await requireAuth()
    const { assignmentId } = params

    const { error } = await supabaseAdmin
      .from('booking_farmers')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('Error removing farmer assignment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove assignment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Farmer assignment removed',
    })
  } catch (error: any) {
    console.error('Error removing farmer assignment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove assignment' },
      { status: 500 }
    )
  }
}
