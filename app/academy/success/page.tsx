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
 * AMBIGUOUS: Academy has no assigned Stripe division ('provisions' | 'digital-studio').
 * Do not retrieve Checkout sessions with Provisions/DS keys until Academy is assigned.
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
      <AcademySuccessCard>
        <AcademySuccessTitle>Thank you for your purchase</AcademySuccessTitle>
        <AcademySuccessMessage>
          Your manual is ready. Open your library to download it.
        </AcademySuccessMessage>
        <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
          Open my library →
        </Link>
      </AcademySuccessCard>
    )
  }

  return (
    <AcademySuccessCard>
      <AcademySuccessMessage>
        Unable to verify payment session: Academy has no assigned Stripe division.
        If you already paid, open My Library — your purchase may still appear after Academy is wired.
      </AcademySuccessMessage>
      <Link href="/dashboard/library" className={`${academyBtnPrimary} mt-8`}>
        My library →
      </Link>
    </AcademySuccessCard>
  )
}
