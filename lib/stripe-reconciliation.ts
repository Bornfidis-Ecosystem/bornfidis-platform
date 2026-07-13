/**
 * Stripe webhook reconciliation helpers — shared by checkout.session.completed
 * and payment_intent.succeeded handlers.
 */

import type Stripe from 'stripe'

export function sessionPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent
  if (!pi) return null
  return typeof pi === 'string' ? pi : pi.id
}

export function resolveCheckoutPaymentType(meta: Stripe.Metadata | null | undefined): string {
  return (
    meta?.checkout_mode ||
    meta?.payment_type ||
    meta?.kind ||
    meta?.type ||
    ''
  ).toLowerCase()
}

export function resolveBookingIdFromMetadata(meta: Stripe.Metadata | null | undefined): string | null {
  const id = meta?.bookingId ?? meta?.booking_id
  return id?.trim() || null
}

export function customerEmailFromSession(session: Stripe.Checkout.Session): string | null {
  return (
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.customer_email ||
    null
  )
}

/** Live vs test Stripe Dashboard deep link for a PaymentIntent. */
export function stripePaymentDashboardUrl(paymentIntentId: string): string {
  const live = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_')
  const base = live ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test'
  return `${base}/payments/${paymentIntentId}`
}
