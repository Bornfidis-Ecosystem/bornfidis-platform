import Link from 'next/link'

import {
  AcademySuccessCard,
  AcademySuccessMessage,
  AcademySuccessTitle,
  academyBtnPrimary,
} from '@/components/academy/AcademySuccessCard'

export const dynamic = 'force-dynamic'

/**
 * Academy success page.
 *
 * Fulfillment is webhook-driven (Digital Studio webhook, payment_type=academy).
 * This page only confirms the return from Stripe — it does NOT retrieve the session
 * or grant access. Access appears in My Library once the webhook records the purchase.
 */
export default async function AcademySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const sessionId = typeof params?.session_id === 'string' ? params.session_id : null

  return (
    <AcademySuccessCard>
      <AcademySuccessTitle>Thank you for your purchase</AcademySuccessTitle>
      <AcademySuccessMessage>
        {sessionId
          ? 'Payment received. Your manual is being added to your library — open it below to download. A confirmation email is on its way.'
          : 'Your manual is ready. Open your library to download it.'}
      </AcademySuccessMessage>
      <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
        Open my library →
      </Link>
    </AcademySuccessCard>
  )
}
