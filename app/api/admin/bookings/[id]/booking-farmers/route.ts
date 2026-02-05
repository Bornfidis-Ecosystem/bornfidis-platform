export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6A: Get farmers assigned to booking
 * GET /api/admin/bookings/[id]/booking-farmers
 * Returns 200 with empty array on error so the admin page does not break (no 500).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const bookingId = params.id

    const { data: bookingFarmers, error } = await supabaseAdmin
      .from('booking_farmers')
      .select(`
        *,
        farmer:farmers(id, name, email, payout_percentage, stripe_connect_status)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching booking farmers:', error)
      return NextResponse.json({ success: true, booking_farmers: [] })
    }

    return NextResponse.json({
      success: true,
      booking_farmers: bookingFarmers || [],
    })
  } catch (error: any) {
    console.error('Error fetching booking farmers:', error)
    return NextResponse.json({ success: true, booking_farmers: [] })
  }
}

