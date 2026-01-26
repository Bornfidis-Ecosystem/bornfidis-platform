import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { BookingChef } from '@/types/booking-chef'

/**
 * Phase 5C: Get booking chef assignment
 * GET /api/admin/bookings/[id]/booking-chef
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const { data: bookingChef, error } = await supabaseAdmin
      .from('booking_chefs')
      .select(`
        *,
        chef:chefs(id, name, email, payout_percentage, stripe_connect_status)
      `)
      .eq('booking_id', bookingId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching booking chef:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch assignment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      booking_chef: bookingChef || null,
    })
  } catch (error: any) {
    console.error('Error fetching booking chef:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

/**
 * Phase 5C: Update booking chef assignment
 * PATCH /api/admin/bookings/[id]/booking-chef
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const body = await request.json()
    const { payout_percentage, notes } = body

    // Fetch booking to get current total
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('quote_total_cents')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Fetch existing assignment
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('booking_chefs')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'No chef assignment found' },
        { status: 404 }
      )
    }

    // Calculate new payout amount if percentage changed
    const updateData: any = {}
    if (payout_percentage !== undefined) {
      if (payout_percentage < 0 || payout_percentage > 100) {
        return NextResponse.json(
          { success: false, error: 'Payout percentage must be between 0 and 100' },
          { status: 400 }
        )
      }
      updateData.payout_percentage = payout_percentage
      updateData.payout_amount_cents = Math.round((booking.quote_total_cents || 0) * (payout_percentage / 100))
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('booking_chefs')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating booking chef:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update assignment' },
        { status: 500 }
      )
    }

    // Also update booking_inquiries
    if (updateData.payout_amount_cents !== undefined) {
      await supabaseAdmin
        .from('booking_inquiries')
        .update({
          chef_payout_amount_cents: updateData.payout_amount_cents,
        })
        .eq('id', bookingId)
    }

    return NextResponse.json({
      success: true,
      booking_chef: updated,
    })
  } catch (error: any) {
    console.error('Error updating booking chef:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

/**
 * Phase 5C: Remove chef assignment
 * DELETE /api/admin/bookings/[id]/booking-chef
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const { error } = await supabaseAdmin
      .from('booking_chefs')
      .delete()
      .eq('booking_id', bookingId)

    if (error) {
      console.error('Error removing booking chef:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove assignment' },
        { status: 500 }
      )
    }

    // Also clear booking_inquiries
    await supabaseAdmin
      .from('booking_inquiries')
      .update({
        assigned_chef_id: null,
        chef_payout_amount_cents: null,
        chef_payout_status: 'not_applicable',
      })
      .eq('id', bookingId)

    return NextResponse.json({
      success: true,
      message: 'Chef assignment removed',
    })
  } catch (error: any) {
    console.error('Error removing booking chef:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove assignment' },
      { status: 500 }
    )
  }
}
