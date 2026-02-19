import Link from 'next/link'
import { notFound } from 'next/navigation'
import Stripe from 'stripe'
import { getAcademyProductBySlug } from '@/lib/academy-products'
import { db } from '@/lib/db'
import { sendAcademyPurchaseConfirmationEmail } from '@/lib/email'
import { AcademyCheckoutCompleteTracker } from '@/components/academy/AcademyCheckoutCompleteTracker'
import { TrackedDownloadLink } from '@/components/academy/TrackedDownloadLink'

export const dynamic = 'force-dynamic'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/**
 * Academy checkout success page.
 * Retrieves Stripe session, verifies payment, ensures AcademyPurchase exists, shows download CTA.
 * Sends confirmation email only when we create the purchase (webhook may run later).
 */
export default async function AcademySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const sessionId = typeof params?.session_id === 'string' ? params.session_id : null

  if (!sessionId) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl border border-forest/20 bg-forest/5 p-10">
          <h1 className="text-2xl font-bold text-forest mb-2">Thank you for your purchase</h1>
          <p className="text-gray-700 mb-8">
            Your manual is ready. Open your library to download it.
          </p>
          <Link
            href="/dashboard/library"
            className="inline-flex items-center justify-center bg-forest text-goldAccent font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-200 ease-in-out"
          >
            Open My Library →
          </Link>
          <p className="mt-6">
            <Link href="/academy" className="text-sm text-forest hover:underline">
              ← Back to Academy
            </Link>
          </p>
        </div>
      </main>
    )
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-700">Unable to verify payment. Your purchase was recorded. Open My Library to download.</p>
        <Link href="/dashboard/library" className="text-forest font-semibold mt-4 inline-block">My Library →</Link>
      </main>
    )
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' })
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
  } catch {
    notFound()
  }

  if (session.payment_status !== 'paid') {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-700">Payment is still processing. You can check your library shortly.</p>
        <Link href="/dashboard/library" className="text-forest font-semibold mt-4 inline-block">My Library →</Link>
      </main>
    )
  }

  const productSlug = session.metadata?.productSlug
  const authUserId = session.client_reference_id
  if (!productSlug || typeof productSlug !== 'string' || !authUserId) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-700">Session data incomplete. If you were charged, contact support@bornfidis.com.</p>
        <Link href="/dashboard/library" className="text-forest font-semibold mt-4 inline-block">My Library →</Link>
      </main>
    )
  }

  const product = getAcademyProductBySlug(productSlug)
  const productTitle = product?.title ?? session.metadata?.productTitle ?? productSlug
  const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : (product?.priceCents ?? 0)

  let purchase = await db.academyPurchase.findUnique({
    where: { stripeSessionId: session.id },
  })

  let weCreatedPurchase = false
  if (!purchase) {
    try {
      purchase = await db.academyPurchase.create({
        data: {
          authUserId,
          productSlug,
          productTitle,
          productPrice: amountTotal,
          stripeSessionId: session.id,
          purchasedAt: new Date(),
        },
      })
      weCreatedPurchase = true
    } catch (e) {
      purchase = await db.academyPurchase.findUnique({
        where: { stripeSessionId: session.id },
      })
    }
  }

  const customerEmail = session.customer_email ?? session.customer_details?.email
  if (weCreatedPurchase && customerEmail && typeof customerEmail === 'string') {
    const baseUrl = getBaseUrl()
    const libraryUrl = `${baseUrl}/dashboard/library`
    const downloadUrl = `${baseUrl}/api/academy/download/${productSlug}`
    await sendAcademyPurchaseConfirmationEmail(customerEmail, {
      productTitle,
      amountPaidCents: amountTotal,
      libraryUrl,
      downloadUrl,
    })
  }

  const downloadHref = `/api/academy/download/${productSlug}`

  return (
    <main className="max-w-xl mx-auto px-6 py-16 text-center">
      <AcademyCheckoutCompleteTracker productSlug={productSlug} productTitle={productTitle} />
      <div className="rounded-2xl border border-forest/20 bg-forest/5 p-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-forest text-goldAccent flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-forest mb-2">
          Thank you for your purchase! Your manual is ready.
        </h1>
        <p className="text-gray-700 mb-6">
          You’ll receive a confirmation email with a download link. You can also access it anytime from your library.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <TrackedDownloadLink
            href={downloadHref}
            productSlug={productSlug}
            productTitle={productTitle}
            source="success_page"
            className="inline-flex items-center justify-center bg-forest text-goldAccent font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-200 ease-in-out"
          >
            Download {productTitle}
          </TrackedDownloadLink>
          <Link
            href="/dashboard/library"
            className="inline-flex items-center justify-center border-2 border-forest text-forest font-semibold px-8 py-3 rounded-xl hover:bg-forest/10 transition-all duration-200 ease-in-out"
          >
            Open My Library →
          </Link>
        </div>
        <p className="mt-8">
          <Link href="/academy" className="text-sm text-forest hover:underline">
            ← Back to Academy
          </Link>
        </p>
      </div>
    </main>
  )
}
