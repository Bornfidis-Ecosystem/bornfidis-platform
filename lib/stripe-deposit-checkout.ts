import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' })
}

export type DepositCheckoutOptions = {
  customerEmail?: string
  guestName?: string
  eventDate?: string
}

/**
 * Fixed Stripe Price deposit checkout (`STRIPE_DEPOSIT_PRICE_ID`).
 * Used by `POST /api/checkout` (mode deposit) and admin `createStripeDepositLink`.
 */
export async function createDepositCheckoutSessionForBooking(
  bookingId: string,
  options: DepositCheckoutOptions = {},
): Promise<{ url: string; session_id: string }> {
  const depositPriceId = process.env.STRIPE_DEPOSIT_PRICE_ID?.trim()
  if (!depositPriceId) {
    throw new Error('Missing required env var: STRIPE_DEPOSIT_PRICE_ID')
  }

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('booking_inquiries')
    .select('id, name, email')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw new Error('Booking not found')
  }

  const stripe = getStripe()
  const siteUrl = getSiteUrl()
  const customerEmail = options.customerEmail ?? booking.email ?? undefined
  const guestName = options.guestName ?? booking.name ?? ''

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail || undefined,
    line_items: [{ price: depositPriceId, quantity: 1 }],
    success_url: `${siteUrl}/thanks?type=deposit&booking_id=${encodeURIComponent(bookingId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/book`,
    metadata: {
      booking_id: bookingId,
      bookingId,
      checkout_mode: 'deposit',
      payment_type: 'deposit',
      type: 'deposit',
      guest_name: guestName,
      event_date: options.eventDate ?? '',
    },
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.')
  }

  const { error: updateError } = await supabaseAdmin
    .from('booking_inquiries')
    .update({
      stripe_session_id: session.id,
      stripe_payment_link_url: session.url,
      stripe_invoice_id: session.id,
      stripe_payment_status: 'unpaid',
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Error saving Stripe deposit session to booking:', updateError)
  }

  return { url: session.url, session_id: session.id }
}
