export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { tryPayoutForBooking } from '@/lib/payout-engine'

/**
 * Phase 5D: Admin releases payout (removes hold and triggers payout)
 * POST /api/admin/bookings/[id]/release-payout
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
      .select('id, payout_hold, fully_paid_at, job_completed_at')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Release hold
    const now = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        payout_hold: false,
        payout_hold_reason: null,
        payout_released_at: now,
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error releasing payout:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to release payout hold' },
        { status: 500 }
      )
    }

    // Update booking_chefs payout_status
    const { data: bookingChef } = await supabaseAdmin
      .from('booking_chefs')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (bookingChef) {
      await supabaseAdmin
        .from('booking_chefs')
        .update({
          payout_status: 'pending',
        })
        .eq('id', bookingChef.id)
    }

    // Attempt payout if eligible
    if (booking.fully_paid_at && booking.job_completed_at) {
      const payoutResult = await tryPayoutForBooking(bookingId)
      
      if (payoutResult.success && payoutResult.payoutCreated) {
        return NextResponse.json({
          success: true,
          message: 'Payout released and processed',
          payoutId: payoutResult.payoutId,
          transferId: payoutResult.transferId,
        })
      } else if (payoutResult.blockers && payoutResult.blockers.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Payout hold released, but payout blocked',
          blockers: payoutResult.blockers,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payout hold released',
    })
  } catch (error: any) {
    console.error('Error releasing payout:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to release payout' },
      { status: 500 }
    )
  }
}
