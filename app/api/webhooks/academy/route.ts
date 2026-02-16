import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { getAcademyProductBySlug, ACADEMY_UPSELL_SUGGESTION } from '@/lib/academy-products'
import { sendAcademyPurchaseConfirmationEmail } from '@/lib/email'

/**
 * Phase A — Academy Stripe webhook
 * POST /api/webhooks/academy
 *
 * Configure in Stripe Dashboard: Webhooks → Add endpoint → URL this route, event checkout.session.completed.
 * Use the signing secret as STRIPE_ACADEMY_WEBHOOK_SECRET.
 *
 * Idempotent: if stripeSessionId already exists, return 200 without writing.
 * Stores product snapshot (title, price in cents) at purchase time.
 */
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_ACADEMY_WEBHOOK_SECRET

  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY is not set')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  if (!webhookSecret) {
    console.error('STRIPE_ACADEMY_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Academy webhook secret not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' })
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Academy webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const productSlug = session.metadata?.productSlug
  const authUserId = session.client_reference_id

  if (!productSlug || !authUserId) {
    console.error('Academy webhook: missing productSlug or client_reference_id', {
      productSlug,
      authUserId,
    })
    return NextResponse.json({ received: true })
  }

  // TASK 1 — Idempotent: if we already have this session, return 200 immediately
  const existing = await db.academyPurchase.findUnique({
    where: { stripeSessionId: session.id },
  })
  if (existing) {
    return NextResponse.json({ received: true })
  }

  const product = getAcademyProductBySlug(productSlug)
  if (!product) {
    console.error('Academy webhook: unknown product slug', productSlug)
    return NextResponse.json({ received: true })
  }

  try {
    await db.academyPurchase.create({
      data: {
        authUserId,
        productSlug,
        productTitle: product.title,
        productPrice: product.priceCents,
        stripeSessionId: session.id,
        purchasedAt: new Date(),
      },
    })
  } catch (err) {
    console.error('Academy webhook: failed to save purchase', err)
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
  }

  // TASK 5 — Purchase confirmation email (with suggested related product)
  const customerEmail = session.customer_email ?? session.customer_details?.email
  if (customerEmail && typeof customerEmail === 'string') {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const libraryUrl = `${baseUrl}/dashboard/library`
    const suggestedSlug = ACADEMY_UPSELL_SUGGESTION[productSlug]
    const suggestedProduct = suggestedSlug ? getAcademyProductBySlug(suggestedSlug) : null
    await sendAcademyPurchaseConfirmationEmail(customerEmail, {
      productTitle: product.title,
      amountPaidCents: product.priceCents,
      libraryUrl,
      suggestedProduct: suggestedProduct
        ? {
            title: suggestedProduct.title,
            slug: suggestedProduct.slug,
            priceDisplay: suggestedProduct.priceDisplay,
            academyUrl: `${baseUrl}/academy/${suggestedProduct.slug}`,
          }
        : undefined,
    })
  }

  return NextResponse.json({ received: true })
}
