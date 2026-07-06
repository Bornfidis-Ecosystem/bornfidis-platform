import Link from 'next/link'
import { notFound } from 'next/navigation'
import Stripe from 'stripe'

import {
  AcademySuccessCard,
  AcademySuccessMessage,
  AcademySuccessTitle,
  academyBtnPrimary,
  academyBtnSecondary,
} from '@/components/academy/AcademySuccessCard'
import { AcademyCheckoutCompleteTracker } from '@/components/academy/AcademyCheckoutCompleteTracker'
import { TrackedDownloadLink } from '@/components/academy/TrackedDownloadLink'
import { getAcademyProductBySlugPublic } from '@/lib/academy-products-public'
import { db } from '@/lib/db'
import { sendAcademyPurchaseConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export default async function AcademySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const sessionId = typeof params?.session_id === 'string' ? params.session_id : null

  if (!sessionId) {
    return (
      <AcademySuccessCard>
        <AcademySuccessTitle>Thank you for your purchase</AcademySuccessTitle>
        <AcademySuccessMessage>Your manual is ready. Open your library to download it.</AcademySuccessMessage>
        <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
          Open my library →
        </Link>
      </AcademySuccessCard>
    )
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return (
      <AcademySuccessCard>
        <AcademySuccessMessage>
          Unable to verify payment. Your purchase was recorded. Open My Library to download.
        </AcademySuccessMessage>
        <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
          My library →
        </Link>
      </AcademySuccessCard>
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
      <AcademySuccessCard>
        <AcademySuccessMessage>
          Payment is still processing. You can check your library shortly.
        </AcademySuccessMessage>
        <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
          My library →
        </Link>
      </AcademySuccessCard>
    )
  }

  const productSlug = session.metadata?.productSlug
  const authUserId = session.client_reference_id
  if (!productSlug || typeof productSlug !== 'string' || !authUserId) {
    return (
      <AcademySuccessCard>
        <AcademySuccessMessage>
          Session data incomplete. If you were charged, contact support@bornfidis.com.
        </AcademySuccessMessage>
        <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
          My library →
        </Link>
      </AcademySuccessCard>
    )
  }

  const product = await getAcademyProductBySlugPublic(productSlug)
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
    } catch {
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
    <AcademySuccessCard>
      <AcademyCheckoutCompleteTracker productSlug={productSlug} productTitle={productTitle} />
      <div
        className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#ffbc00]/35 bg-[#002747] text-[#faf6f0]"
        aria-hidden
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <AcademySuccessTitle>Thank you — your manual is ready</AcademySuccessTitle>
      <AcademySuccessMessage>
        You&apos;ll receive a confirmation email with a download link. You can also access it anytime from
        your library.
      </AcademySuccessMessage>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <TrackedDownloadLink
          href={downloadHref}
          productSlug={productSlug}
          productTitle={productTitle}
          source="success_page"
          className={academyBtnPrimary}
        >
          Download {productTitle}
        </TrackedDownloadLink>
        <Link href="/dashboard/library" className={academyBtnSecondary}>
          Open my library →
        </Link>
      </div>
    </AcademySuccessCard>
  )
}
