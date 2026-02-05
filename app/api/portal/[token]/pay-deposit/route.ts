export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

/**
 * Phase 4B: Create deposit payment session via portal
 * POST /api/portal/[token]/pay-deposit
 * 
 * Validates token and creates Stripe checkout for deposit payment
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

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Payments are temporarily unavailable' },
        { status: 503 }
      )
    }

    // Verify token and get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, name, email, quote_total_cents, deposit_amount_cents, paid_at, customer_portal_token_revoked_at')
      .eq('customer_portal_token', token)
      .is('customer_portal_token_revoked_at', null)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Validate payment state
    if (booking.paid_at) {
      return NextResponse.json(
        { success: false, error: 'Deposit has already been paid' },
        { status: 400 }
      )
    }

    const depositAmountCents = booking.deposit_amount_cents || 0
    if (depositAmountCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'No deposit amount set. Please contact us.' },
        { status: 400 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit - ${booking.name || 'Booking'}`,
              description: `Deposit payment for your event`,
            },
            unit_amount: depositAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/portal/${token}?payment=success`,
      cancel_url: `${siteUrl}/portal/${token}?payment=cancel`,
      customer_email: booking.email || undefined,
      metadata: {
        booking_id: booking.id,
        customer_name: booking.name || '',
        payment_type: 'deposit',
      },
    })

    // Save session ID and deposit amount to booking
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        stripe_session_id: session.id,
        deposit_amount_cents: depositAmountCents,
      })
      .eq('id', booking.id)

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
    console.error('Error creating deposit payment session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
