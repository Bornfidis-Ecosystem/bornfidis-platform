import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getAcademyProductBySlug, ACADEMY_UPSELL_SUGGESTION } from '@/lib/academy-products'
import { sendAcademyPurchaseConfirmationEmail } from '@/lib/email'

/**
 * TASK 3 — Free product claim
 * POST /api/academy/claim
 * Body: { productId: string } (product slug)
 *
 * Creates AcademyPurchase record (product snapshot, stripeSessionId = free-{uuid}),
 * then returns redirect URL to Library. Idempotent: if user already claimed this product, return library URL.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentSupabaseUser()
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to claim a free product' },
      { status: 401 }
    )
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

  const isFree =
    !product.stripePriceId ||
    product.priceDisplay === 'FREE' ||
    product.priceCents === 0
  if (!isFree) {
    return NextResponse.json(
      { error: 'This product is not free; use checkout to purchase' },
      { status: 400 }
    )
  }

  // Idempotent: already claimed?
  const existing = await db.academyPurchase.findFirst({
    where: {
      authUserId: user.id,
      productSlug: product.slug,
      stripeSessionId: { startsWith: 'free-' },
    },
  })
  const libraryUrl = '/dashboard/library?claimed=1'
  if (existing) {
    return NextResponse.json({ url: libraryUrl })
  }

  const freeSessionId = `free-${randomUUID()}`

  await db.academyPurchase.create({
    data: {
      authUserId: user.id,
      productSlug: product.slug,
      productTitle: product.title,
      productPrice: 0,
      stripeSessionId: freeSessionId,
      purchasedAt: new Date(),
    },
  })

  // Post-purchase confirmation email: productTitle, library link, suggest 1 related product
  const customerEmail = user.email
  if (customerEmail) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const libraryUrl = `${baseUrl}/dashboard/library`
    const suggestedSlug = ACADEMY_UPSELL_SUGGESTION[product.slug] ?? 'llc-starter-kit'
    const suggestedProduct = getAcademyProductBySlug(suggestedSlug)
    await sendAcademyPurchaseConfirmationEmail(customerEmail, {
      productTitle: product.title,
      amountPaidCents: 0,
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

  return NextResponse.json({ url: libraryUrl })
}
