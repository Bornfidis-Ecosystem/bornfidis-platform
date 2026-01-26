import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

/**
 * Phase 3B + 3C: Create Stripe Checkout Session for remaining balance payment
 * POST /api/stripe/create-balance-session
 * 
 * Body:
 * - booking_id: string
 * 
 * Authentication: Optional (admin) or public (with valid booking_id)
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get authenticated user (optional for Phase 3C client portal)
    const user = await getServerAuthUser()
    // If no user, we'll validate booking_id instead (public access)

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { booking_id } = body

    // Validate input
    if (!booking_id) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. booking_id is required.' },
        { status: 400 }
      )
    }

    // Fetch booking with quote data (Phase 3C fields)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id, name, email, quote_total_cents, deposit_amount_cents, deposit_percentage, balance_paid_at, balance_amount_cents, paid_at, status')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Use Phase 3C field names (quote_total_cents)
    const totalCents = booking.quote_total_cents || 0
    const depositPaidCents = booking.deposit_amount_cents || 0
    const storedBalanceCents = booking.balance_amount_cents || 0

    // Validate quote exists
    if (totalCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quote total must be greater than 0. Please save the quote first.' },
        { status: 400 }
      )
    }

    // Check if deposit is paid (Phase 3A requirement)
    const depositPaid = !!booking.paid_at || booking.status === 'booked'
    if (!depositPaid && depositPaidCents > 0) {
      return NextResponse.json(
        { success: false, error: 'Deposit must be paid before requesting balance payment.' },
        { status: 400 }
      )
    }

    // Use stored balance_amount_cents if available, otherwise calculate
    const balanceCents = storedBalanceCents > 0 ? storedBalanceCents : Math.max(totalCents - depositPaidCents, 0)

    // Validate balance
    if (balanceCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'No remaining balance to pay. Deposit already covers the full amount.' },
        { status: 400 }
      )
    }

    if (booking.balance_paid_at) {
      return NextResponse.json(
        { success: false, error: 'Balance has already been paid.' },
        { status: 400 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Final Balance - ${booking.name || 'Booking'}`,
              description: `Final balance payment for booking #${booking_id.slice(0, 8)}`,
            },
            unit_amount: balanceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings/${booking_id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings/${booking_id}?payment=cancel`,
      customer_email: booking.email || undefined,
      metadata: {
        booking_id: booking_id,
        payment_type: 'balance',
        customer_name: booking.name || '',
      },
    })

    // Save session ID to booking (Phase 3C: stripe_balance_session_id)
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        stripe_balance_session_id: session.id,
        // balance_amount_cents should already be set from quote save
        // Don't update status yet - wait for webhook
      })
      .eq('id', booking_id)

    if (updateError) {
      console.error('Error saving Stripe balance session to booking:', updateError)
      // Still return success with URL even if save fails
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      session_id: session.id,
    })
  } catch (error: any) {
    console.error('Error creating Stripe balance checkout session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
