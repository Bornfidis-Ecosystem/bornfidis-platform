import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createDepositCheckoutSessionForBooking } from '@/lib/stripe-deposit-checkout'
import Stripe from 'stripe'

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

function assertEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`Missing required env var: ${name}`)
  return value.trim()
}

type CheckoutMode = 'deposit' | 'balance' | 'consulting'

interface UnifiedBody {
  mode?: CheckoutMode
  bookingId?: string
  booking_id?: string
  customerEmail?: string
  customer_email?: string
  amount?: number
  guestName?: string
  guest_name?: string
  eventDate?: string
  event_date?: string
  /** Legacy passive-income checkout */
  priceId?: string
}

/**
 * POST /api/checkout
 *
 * **Legacy (unchanged):** `{ priceId }` → one-off Stripe Price → `/passive/success`
 *
 * **Bornfidis:**
 * - `mode: 'deposit'` — fixed Price `STRIPE_DEPOSIT_PRICE_ID` (admin-only; requires `bookingId`)
 * - `mode: 'balance'` — dynamic `price_data` from **server-calculated** remaining balance (`bookingId`)
 * - `mode: 'consulting'` — fixed Price `STRIPE_CONSULT_PRICE_ID`
 */
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  let body: UnifiedBody
  try {
    body = (await req.json()) as UnifiedBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const siteUrl = getSiteUrl()

  try {
    const stripe = getStripe()

    // ─── Legacy: passive income (price catalog only) ─────────────────────
    if (
      typeof body.priceId === 'string' &&
      body.priceId.length > 0 &&
      body.mode === undefined
    ) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{ price: body.priceId, quantity: 1 }],
        success_url: `${baseUrl}/passive/success`,
        cancel_url: `${baseUrl}/passive`,
      })

      return NextResponse.json({ url: session.url })
    }

    const mode = body.mode
    if (!mode || !['deposit', 'balance', 'consulting'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid or missing mode. Use deposit | balance | consulting, or priceId for passive checkout.' },
        { status: 400 },
      )
    }

    const bookingId = body.bookingId ?? body.booking_id
    const customerEmail = body.customerEmail ?? body.customer_email
    const guestName = body.guestName ?? body.guest_name
    const eventDate = body.eventDate ?? body.event_date

    // ─── Consulting: fixed price, no booking ─────────────────────────────
    if (mode === 'consulting') {
      const consultPriceId = assertEnv('STRIPE_CONSULT_PRICE_ID', process.env.STRIPE_CONSULT_PRICE_ID)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customerEmail || undefined,
        line_items: [{ price: consultPriceId, quantity: 1 }],
        success_url: `${siteUrl}/thanks?checkout=consulting&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/book`,
        metadata: {
          checkout_mode: 'consulting',
          payment_type: 'consulting',
          guest_name: guestName ?? '',
          customer_email: customerEmail ?? '',
        },
      })

      return NextResponse.json({ success: true, url: session.url, session_id: session.id })
    }

    // ─── Deposit: fixed catalog price (admin creates session) ─────────────
    if (mode === 'deposit') {
      const user = await getServerAuthUser()
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      if (!bookingId) {
        return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 })
      }

      try {
        const { url, session_id } = await createDepositCheckoutSessionForBooking(bookingId, {
          customerEmail,
          guestName,
          eventDate,
        })
        return NextResponse.json({ success: true, url, session_id })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to create deposit checkout'
        const status = message === 'Booking not found' ? 404 : 500
        return NextResponse.json({ success: false, error: message }, { status })
      }
    }

    // ─── Balance: server-calculated amount (dynamic price_data) ───────────
    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 })
    }

    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from('booking_inquiries')
      .select(
        'id, name, email, event_date, quote_total_cents, deposit_amount_cents, deposit_percentage, balance_paid_at, balance_amount_cents, paid_at, status',
      )
      .eq('id', bookingId)
      .single()

    if (bookingErr || !booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    const totalCents = booking.quote_total_cents || 0
    const depositPaidCents = booking.deposit_amount_cents || 0
    const storedBalanceCents = booking.balance_amount_cents || 0

    if (totalCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quote total must be greater than 0. Save the quote first.' },
        { status: 400 },
      )
    }

    const depositPaid =
      !!booking.paid_at || String(booking.status || '').toLowerCase() === 'booked'
    if (!depositPaid && depositPaidCents > 0) {
      return NextResponse.json(
        { success: false, error: 'Deposit must be paid before requesting balance payment.' },
        { status: 400 },
      )
    }

    const balanceCents =
      storedBalanceCents > 0 ? storedBalanceCents : Math.max(totalCents - depositPaidCents, 0)

    if (balanceCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'No remaining balance to pay.' },
        { status: 400 },
      )
    }

    if (booking.balance_paid_at) {
      return NextResponse.json({ success: false, error: 'Balance has already been paid.' }, { status: 400 })
    }

    if (typeof body.amount === 'number' && Number.isInteger(body.amount) && body.amount > 0) {
      if (Math.abs(body.amount - balanceCents) > 1) {
        return NextResponse.json(
          {
            success: false,
            error: `Amount mismatch. Expected ${balanceCents} cents (server balance).`,
          },
          { status: 400 },
        )
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail || booking.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Bornfidis Private Dining Balance',
              description: `Final balance for booking #${String(bookingId).slice(0, 8)}`,
            },
            unit_amount: balanceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/thanks?type=balance&booking_id=${encodeURIComponent(bookingId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book`,
      metadata: {
        booking_id: bookingId,
        bookingId,
        checkout_mode: 'balance',
        payment_type: 'balance',
        balance_amount_cents: String(balanceCents),
        guest_name: booking.name || '',
        event_date: booking.event_date
          ? String(booking.event_date).slice(0, 10)
          : '',
      },
    })

    await supabaseAdmin
      .from('booking_inquiries')
      .update({
        stripe_balance_session_id: session.id,
        balance_session_id: session.id,
      })
      .eq('id', bookingId)

    return NextResponse.json({ success: true, url: session.url, session_id: session.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create checkout session'
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
