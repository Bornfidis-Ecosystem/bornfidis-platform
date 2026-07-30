export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { canMarkPipelineCompleted } from '@/lib/booking-pipeline-status'

/**
 * Phase 5D: Admin confirms job completion
 * POST /api/admin/bookings/[id]/confirm-completion
 *
 * Sets job_completed_at and advances BookingInquiry.status → completed
 * when the booking is not cancelled / declined / refunded.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, job_completed_at, job_completed_by, status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    const maySetCompleted = canMarkPipelineCompleted(booking.status)
    const statusAlreadyCompleted =
      (booking.status || '').trim().toLowerCase() === 'completed'

    // Idempotent path: job already marked complete — heal pipeline status if safe.
    if (booking.job_completed_at) {
      if (maySetCompleted && !statusAlreadyCompleted) {
        await supabaseAdmin
          .from('booking_inquiries')
          .update({ status: 'completed' })
          .eq('id', bookingId)
      }

      return NextResponse.json({
        success: true,
        message: 'Job already completed',
        job_completed_at: booking.job_completed_at,
        job_completed_by: booking.job_completed_by,
        status: maySetCompleted ? 'completed' : booking.status,
      })
    }

    const now = new Date().toISOString()
    const updatePayload: Record<string, string> = {
      job_completed_at: now,
      job_completed_by: 'admin',
    }
    if (maySetCompleted) {
      updatePayload.status = 'completed'
    }

    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update(updatePayload)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error confirming completion:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to confirm completion' },
        { status: 500 }
      )
    }

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
      message: maySetCompleted
        ? 'Job completion confirmed'
        : 'Job completion timestamp set; pipeline status left unchanged (cancelled/declined/refunded)',
      job_completed_at: now,
      status: maySetCompleted ? 'completed' : booking.status,
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
