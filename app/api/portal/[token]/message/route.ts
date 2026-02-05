export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 4B: Send message from customer portal
 * POST /api/portal/[token]/message
 * 
 * Body:
 * - name: string
 * - email: string
 * - message: string
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, message } = body

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Verify token and get booking ID
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id')
      .eq('customer_portal_token', token)
      .is('customer_portal_token_revoked_at', null)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Insert message
    const { data: messageData, error: insertError } = await supabaseAdmin
      .from('customer_messages')
      .insert({
        booking_id: booking.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting customer message:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: messageData.id,
        created_at: messageData.created_at,
      },
    })
  } catch (error: any) {
    console.error('Error sending customer message:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
