import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth'
import { createDepositCheckoutSessionForBooking } from '@/lib/stripe-deposit-checkout'

/**
 * DEPRECATED — use POST /api/checkout with mode: 'deposit' instead.
 * Kept for backwards compatibility; delegates to the canonical helper.
 *
 * POST /api/stripe/create-deposit-session
 * Body: { booking_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerAuthUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured.' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const bookingId: string | undefined = body.booking_id ?? body.bookingId

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'booking_id is required.' },
        { status: 400 },
      )
    }

    const { url, session_id, amount_cents } = await createDepositCheckoutSessionForBooking(bookingId)

    return NextResponse.json({
      success: true,
      url,
      session_id,
      amount_cents,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payment session'
    console.error('create-deposit-session error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
