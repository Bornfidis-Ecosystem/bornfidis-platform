export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6A: Assign farmer to booking
 * POST /api/admin/bookings/[id]/assign-farmer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
    const bookingId = params.id

    const body = await request.json()
    const { farmer_id, role, payout_percent, notes } = body

    if (!farmer_id || !role) {
      return NextResponse.json(
        { success: false, error: 'Farmer ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['produce', 'fish', 'meat', 'dairy', 'spice', 'beverage']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate payout percent
    const payoutPercent = payout_percent || 60
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
        { success: false, error: 'Booking must have a quote total before assigning a farmer' },
        { status: 400 }
      )
    }

    // Fetch farmer
    const { data: farmer, error: farmerError } = await supabaseAdmin
      .from('farmers')
      .select('id, name, status, stripe_connect_status, payouts_enabled')
      .eq('id', farmer_id)
      .single()

    if (farmerError || !farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      )
    }

    if (farmer.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Farmer must be approved to receive assignments' },
        { status: 400 }
      )
    }

    // Check if farmer already assigned to this booking with this role
    const { data: existing } = await supabaseAdmin
      .from('booking_farmers')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('farmer_id', farmer_id)
      .eq('role', role)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Farmer already assigned to this booking as ${role}` },
        { status: 400 }
      )
    }

    // Calculate payout amount
    const payoutAmountCents = Math.round(booking.quote_total_cents * (payoutPercent / 100))

    // Create booking_farmers record
    const { data: bookingFarmer, error: insertError } = await supabaseAdmin
      .from('booking_farmers')
      .insert({
        booking_id: bookingId,
        farmer_id: farmer_id,
        role: role,
        payout_percent: payoutPercent,
        payout_amount_cents: payoutAmountCents,
        payout_status: 'pending',
        notes: notes || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating booking_farmer:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to assign farmer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Farmer assigned successfully',
      booking_farmer: {
        id: bookingFarmer.id,
        payout_percent: payoutPercent,
        payout_amount_cents: payoutAmountCents,
      },
    })
  } catch (error: any) {
    console.error('Error assigning farmer:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign farmer' },
      { status: 500 }
    )
  }
}
