import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { getStripeClient } from '@/lib/stripe'
import { getAcademyProductBySlugPublic } from '@/lib/academy-products-public'

export const dynamic = 'force-dynamic'

/**
 * POST /api/academy/checkout
 *
 * Academy paid checkout. Academy is a product line inside the Digital Studio
 * commercial division, so it charges on the Digital Studio Stripe account.
 * Fulfillment happens in the shared Digital Studio webhook
 * (app/api/stripe/digital-studio/webhook/route.ts) via the `payment_type=academy`
 * branch — NOT on the browser reaching the success page.
 *
 * Body: { productId: string }  // Academy product slug
 * Returns: { url: string }     // Stripe Checkout Session URL
 */

/** Neutral statement-descriptor suffix so Academy charges read differently from
 *  Digital Studio client work on the shared account. Kept short + alphabetic to
 *  satisfy Stripe's suffix rules (<= 22 chars combined, no <>\'"* characters). */
const ACADEMY_STATEMENT_DESCRIPTOR_SUFFIX = 'EDU'

function isStatementDescriptorError(err: unknown): boolean {
  const e = err as { type?: string; param?: string; message?: string } | undefined
  if (!e) return false
  if (e.type !== 'StripeInvalidRequestError') return false
  const haystack = `${e.param ?? ''} ${e.message ?? ''}`.toLowerCase()
  return /statement.?descriptor/.test(haystack)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentSupabaseUser()
  if (!user?.id) {
    return NextResponse.json(
      { error: 'You must be signed in to purchase' },
      { status: 401 },
    )
  }

  let body: { productId?: string; productSlug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = (body.productId || body.productSlug || '').trim()
  if (!slug) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const product = await getAcademyProductBySlugPublic(slug)
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Free products go through /api/academy/claim, not paid checkout.
  const isFree =
    !product.stripePriceId ||
    product.priceDisplay === 'FREE' ||
    product.priceCents === 0
  if (isFree) {
    return NextResponse.json(
      { error: 'This product is free — use claim instead of checkout' },
      { status: 400 },
    )
  }
  // Price always comes from the trusted server-side product record.
  if (!product.stripePriceId) {
    return NextResponse.json(
      { error: 'Product is not purchasable (no Stripe price configured)' },
      { status: 400 },
    )
  }

  let stripe: Stripe
  try {
    stripe = getStripeClient('digital-studio')
  } catch (e) {
    console.error('[academy checkout]', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 500 })
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const baseParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email || undefined,
    // Attribution fallback; metadata remains authoritative in the webhook.
    client_reference_id: user.id,
    line_items: [
      {
        // Trusted server-side price ID — never a browser-supplied amount.
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/academy/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/academy/${product.slug}`,
    metadata: {
      division: 'digital-studio',
      payment_type: 'academy',
      auth_user_id: user.id,
      product_slug: product.slug,
    },
  }

  try {
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create({
        ...baseParams,
        payment_intent_data: {
          statement_descriptor_suffix: ACADEMY_STATEMENT_DESCRIPTOR_SUFFIX,
        },
      })
    } catch (descriptorErr) {
      // If the DS account has no compatible descriptor prefix, Stripe rejects the
      // suffix. Don't fail the purchase over cosmetics — retry without it.
      if (!isStatementDescriptorError(descriptorErr)) throw descriptorErr
      console.warn(
        '[academy checkout] statement_descriptor_suffix rejected; retrying without it:',
        descriptorErr instanceof Error ? descriptorErr.message : descriptorErr,
      )
      session = await stripe.checkout.sessions.create(baseParams)
    }

    if (!session.url) {
      return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 })
    }
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(
      '[academy checkout] session create failed:',
      e instanceof Error ? e.message : e,
    )
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 })
  }
}
