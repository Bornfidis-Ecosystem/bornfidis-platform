import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5C: Assign chef to booking with payout percentage
 * POST /api/admin/bookings/[id]/assign-chef-v2
 * 
 * Creates booking_chefs record with custom payout percentage
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { chef_id, payout_percentage, notes } = body

    if (!chef_id) {
      return NextResponse.json(
        { success: false, error: 'Chef ID is required' },
        { status: 400 }
      )
    }

    // Validate payout percentage (0-100)
    const payoutPercent = payout_percentage || 70
    if (payoutPercent < 0 || payoutPercent > 100) {
      return NextResponse.json(
        { success: false, error: 'Payout percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, quote_total_cents')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.quote_total_cents || booking.quote_total_cents <= 0) {
      return NextResponse.json(
        { success: false, error: 'Booking must have a quote total before assigning a chef' },
        { status: 400 }
      )
    }

    // Fetch chef
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select('id, name, status, stripe_connect_status, payouts_enabled')
      .eq('id', chef_id)
      .single()

    if (chefError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    if (chef.status !== 'active' && chef.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Chef must be active or approved to receive assignments' },
        { status: 400 }
      )
    }

    // Check if booking already has a chef assigned
    const { data: existingAssignment } = await supabaseAdmin
      .from('booking_chefs')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Booking already has an assigned chef. Remove existing assignment first.' },
        { status: 400 }
      )
    }

    // Calculate payout amount
    const payoutAmountCents = Math.round(booking.quote_total_cents * (payoutPercent / 100))

    // Create booking_chefs record
    const { data: bookingChef, error: insertError } = await supabaseAdmin
      .from('booking_chefs')
      .insert({
        booking_id: bookingId,
        chef_id: chef_id,
        payout_percentage: payoutPercent,
        payout_amount_cents: payoutAmountCents,
        status: 'assigned',
        notes: notes || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating booking_chef:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to assign chef' },
        { status: 500 }
      )
    }

    // Also update booking_inquiries for backward compatibility
    await supabaseAdmin
      .from('booking_inquiries')
      .update({
        assigned_chef_id: chef_id,
        chef_payout_amount_cents: payoutAmountCents,
        chef_payout_status: 'pending',
      })
      .eq('id', bookingId)

    return NextResponse.json({
      success: true,
      message: 'Chef assigned successfully',
      booking_chef: {
        id: bookingChef.id,
        payout_percentage: payoutPercent,
        payout_amount_cents: payoutAmountCents,
        platform_fee_cents: booking.quote_total_cents - payoutAmountCents,
      },
    })
  } catch (error: any) {
    console.error('Error assigning chef:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign chef' },
      { status: 500 }
    )
  }
}
