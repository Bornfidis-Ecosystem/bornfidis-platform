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
  /** Override amount in cents (otherwise uses booking deposit fields). */
  amountCents?: number
}

/**
 * Dynamic deposit Checkout Session matching portal `/api/portal/[token]/pay-deposit`.
 * Amount = options.amountCents ?? deposit_amount_cents ?? quote_deposit_cents.
 * Does not use STRIPE_DEPOSIT_PRICE_ID (deprecated for Provisions deposits).
 */
export async function createDepositCheckoutSessionForBooking(
  bookingId: string,
  options: DepositCheckoutOptions = {},
): Promise<{ url: string; session_id: string; amount_cents: number }> {
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('booking_inquiries')
    .select(
      'id, name, email, paid_at, deposit_amount_cents, quote_deposit_cents, customer_portal_token',
    )
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw new Error('Booking not found')
  }

  if (booking.paid_at) {
    throw new Error('Deposit has already been paid for this booking')
  }

  const amountCents =
    options.amountCents ??
    booking.deposit_amount_cents ??
    booking.quote_deposit_cents ??
    0

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error(
      'Deposit amount must be greater than 0. Save a quote with a deposit on the booking first.',
    )
  }

  const stripe = getStripe()
  const siteUrl = getSiteUrl()
  const customerEmail = options.customerEmail ?? booking.email ?? undefined
  const guestName = options.guestName ?? booking.name ?? ''
  const portalToken =
    typeof booking.customer_portal_token === 'string' ? booking.customer_portal_token.trim() : ''

  const successUrl = portalToken
    ? `${siteUrl}/portal/${portalToken}?payment=success`
    : `${siteUrl}/thanks?type=deposit&booking_id=${encodeURIComponent(bookingId)}&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = portalToken
    ? `${siteUrl}/portal/${portalToken}?payment=cancel`
    : `${siteUrl}/book`

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Deposit - ${guestName || 'Booking'}`,
            description: 'Deposit payment for your event',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      booking_id: bookingId,
      bookingId,
      checkout_mode: 'deposit',
      payment_type: 'deposit',
      type: 'deposit',
      guest_name: guestName,
      event_date: options.eventDate ?? '',
      deposit_amount_cents: String(amountCents),
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
      deposit_amount_cents: amountCents,
      quote_deposit_cents: amountCents,
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Error saving Stripe deposit session to booking:', updateError)
  }

  return { url: session.url, session_id: session.id, amount_cents: amountCents }
}
