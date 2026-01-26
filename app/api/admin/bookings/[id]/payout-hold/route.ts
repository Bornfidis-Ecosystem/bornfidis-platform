import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5D: Admin sets payout hold
 * POST /api/admin/bookings/[id]/payout-hold
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const body = await request.json()
    const { hold, reason } = body

    if (typeof hold !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'hold must be a boolean' },
        { status: 400 }
      )
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update payout hold
    const updateData: any = {
      payout_hold: hold,
      payout_hold_reason: hold ? (reason || null) : null,
    }

    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error setting payout hold:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to set payout hold' },
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
          payout_status: hold ? 'on_hold' : 'pending',
        })
        .eq('id', bookingChef.id)
    }

    return NextResponse.json({
      success: true,
      message: hold ? 'Payout put on hold' : 'Payout hold released',
      payout_hold: hold,
      payout_hold_reason: hold ? reason : null,
    })
  } catch (error: any) {
    console.error('Error setting payout hold:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set payout hold' },
      { status: 500 }
    )
  }
}
