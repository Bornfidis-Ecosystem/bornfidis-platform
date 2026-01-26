import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5D: Admin confirms job completion
 * POST /api/admin/bookings/[id]/confirm-completion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    // Fetch booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, job_completed_at, job_completed_by')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If not already completed by chef, mark as completed by admin
    if (!booking.job_completed_at) {
      const now = new Date().toISOString()
      const { error: updateError } = await supabaseAdmin
        .from('booking_inquiries')
        .update({
          job_completed_at: now,
          job_completed_by: 'admin',
        })
        .eq('id', bookingId)

      if (updateError) {
        console.error('Error confirming completion:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to confirm completion' },
          { status: 500 }
        )
      }

      // Update booking_chefs if exists
      const { data: bookingChef } = await supabaseAdmin
        .from('booking_chefs')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

      if (bookingChef) {
        await supabaseAdmin
          .from('booking_chefs')
          .update({
            status: 'completed',
            completed_at: now,
          })
          .eq('id', bookingChef.id)
      }

      return NextResponse.json({
        success: true,
        message: 'Job completion confirmed',
        job_completed_at: now,
      })
    }

    // Already completed, just confirm
    return NextResponse.json({
      success: true,
      message: 'Job already completed',
      job_completed_at: booking.job_completed_at,
      job_completed_by: booking.job_completed_by,
    })
  } catch (error: any) {
    console.error('Error confirming completion:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm completion' },
      { status: 500 }
    )
  }
}
