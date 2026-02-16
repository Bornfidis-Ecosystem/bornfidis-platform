import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { getAcademyProductBySlug } from '@/lib/academy-products'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/**
 * POST /api/academy/checkout
 * Body: { productId: string } (product slug)
 * Creates Stripe Checkout session for Academy product. User must be logged in.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentSupabaseUser()
  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to purchase' }, { status: 401 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  let body: { productId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const productId = body.productId
  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const product = getAcademyProductBySlug(productId)
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (!product.stripePriceId || product.priceDisplay === 'FREE') {
    return NextResponse.json(
      { error: 'This product is free; use the Get for free link' },
      { status: 400 }
    )
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' })
  const baseUrl = getBaseUrl()

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/library`,
      cancel_url: `${baseUrl}/academy`,
      client_reference_id: user.id,
      metadata: {
        productSlug: product.slug,
        source: 'academy',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Academy checkout error:', error)
    return NextResponse.json(
      { error: 'Unable to create checkout session' },
      { status: 500 }
    )
  }
}
