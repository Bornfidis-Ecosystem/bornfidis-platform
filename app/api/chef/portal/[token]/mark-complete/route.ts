import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5D: Chef marks job as complete
 * POST /api/chef/portal/[token]/mark-complete
 * 
 * Public route (token-based auth)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    const body = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify chef token and get chef
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select('id')
      .eq('chef_portal_token', token)
      .single()

    if (chefError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Verify booking is assigned to this chef
    const { data: bookingChef, error: bookingChefError } = await supabaseAdmin
      .from('booking_chefs')
      .select('id, booking_id')
      .eq('booking_id', booking_id)
      .eq('chef_id', chef.id)
      .single()

    if (bookingChefError || !bookingChef) {
      return NextResponse.json(
        { success: false, error: 'Booking not assigned to this chef' },
        { status: 403 }
      )
    }

    // Check if already completed
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('job_completed_at')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.job_completed_at) {
      return NextResponse.json(
        { success: false, error: 'Job already marked as complete' },
        { status: 400 }
      )
    }

    // Mark job as complete
    const now = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        job_completed_at: now,
        job_completed_by: 'chef',
      })
      .eq('id', booking_id)

    if (updateError) {
      console.error('Error marking job complete:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to mark job as complete' },
        { status: 500 }
      )
    }

    // Update booking_chefs status to completed
    await supabaseAdmin
      .from('booking_chefs')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('id', bookingChef.id)

    return NextResponse.json({
      success: true,
      message: 'Job marked as complete',
      job_completed_at: now,
    })
  } catch (error: any) {
    console.error('Error marking job complete:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark job as complete' },
      { status: 500 }
    )
  }
}
