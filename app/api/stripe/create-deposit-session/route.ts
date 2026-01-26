import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

/**
 * Phase 3A: Create Stripe Checkout Session for deposit payment
 * POST /api/stripe/create-deposit-session
 * 
 * Body:
 * - booking_id: string
 * - amount: number (USD)
 * - customer_email?: string
 * - customer_name?: string
 * - internal_notes?: string
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getServerAuthUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { booking_id, amount, customer_email, customer_name, internal_notes } = body

    // Validate input
    if (!booking_id || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. booking_id and amount (greater than 0) are required.' },
        { status: 400 }
      )
    }

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, name, email')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    // Convert amount to cents
    const amountCents = Math.round(amount * 100)

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit - ${customer_name || booking.name || 'Booking'}`,
              description: `Deposit payment for booking #${booking_id.slice(0, 8)}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings/${booking_id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings/${booking_id}?payment=cancelled`,
      customer_email: customer_email || booking.email || undefined,
      metadata: {
        booking_id: booking_id,
        customer_name: customer_name || booking.name || '',
        internal_notes: internal_notes || '',
        type: 'deposit',
      },
    })

    // Save session ID and deposit amount to booking
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        stripe_session_id: session.id,
        deposit_amount_cents: amountCents,
        // Don't update status yet - wait for webhook
      })
      .eq('id', booking_id)

    if (updateError) {
      console.error('Error saving Stripe session to booking:', updateError)
      // Still return success with URL even if save fails
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      session_id: session.id,
    })
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
