import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'

/**
 * Creates a Stripe Checkout session for the booking's remaining balance (admin / server).
 * Mirrors `/api/stripe/create-balance-session` using Prisma.
 */
export async function createBalanceCheckoutSessionForBooking(
  bookingId: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return { success: false, error: 'Stripe is not configured.' }
  }

  const booking = await db.bookingInquiry.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      name: true,
      email: true,
      eventDate: true,
      quoteTotalCents: true,
      depositAmountCents: true,
      balanceAmountCents: true,
      balancePaidAt: true,
      paidAt: true,
      status: true,
    },
  })

  if (!booking) {
    return { success: false, error: 'Booking not found' }
  }

  const totalCents = booking.quoteTotalCents ?? 0
  if (totalCents <= 0) {
    return { success: false, error: 'Quote total must be greater than 0. Save the quote first.' }
  }

  const depositPaidCents = booking.depositAmountCents ?? 0
  const depositPaid =
    !!booking.paidAt || String(booking.status || '').toLowerCase() === 'booked'
  if (!depositPaid && depositPaidCents > 0) {
    return { success: false, error: 'Deposit must be paid before requesting balance payment.' }
  }

  const storedBalance = booking.balanceAmountCents ?? 0
  const balanceCents =
    storedBalance > 0 ? storedBalance : Math.max(totalCents - depositPaidCents, 0)

  if (balanceCents <= 0) {
    return { success: false, error: 'No remaining balance to pay.' }
  }

  if (booking.balancePaidAt) {
    return { success: false, error: 'Balance has already been paid.' }
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-11-20.acacia',
  })

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const eventDateStr = booking.eventDate
    ? new Date(booking.eventDate).toISOString().slice(0, 10)
    : ''

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Final Balance - ${booking.name || 'Booking'}`,
            description: `Final balance payment for booking #${bookingId.slice(0, 8)}`,
          },
          unit_amount: balanceCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${siteUrl}/thanks?type=balance&booking_id=${encodeURIComponent(bookingId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/book`,
    customer_email: booking.email || undefined,
    metadata: {
      booking_id: bookingId,
      bookingId,
      checkout_mode: 'balance',
      payment_type: 'balance',
      balance_amount_cents: String(balanceCents),
      guest_name: booking.name || '',
      event_date: eventDateStr,
    },
  })

  if (!session.url) {
    return { success: false, error: 'Stripe did not return a checkout URL.' }
  }

  const { error: sessionSaveErr } = await supabaseAdmin
    .from('booking_inquiries')
    .update({
      stripe_balance_session_id: session.id,
      balance_session_id: session.id,
    })
    .eq('id', bookingId)

  if (sessionSaveErr) {
    console.error('Error saving balance Stripe session to booking:', sessionSaveErr)
  }

  return { success: true, url: session.url }
}
