import type { ReactNode } from 'react'
import Link from 'next/link'

import {
  academyBody,
  academyBtnPrimary,
  academyBtnSecondary,
  academyHeadline,
  academyLinkBack,
} from '@/components/academy/academy-culinary-classes'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { PageContainer } from '@/components/ui/PageContainer'

export function AcademySuccessCard({ children }: { children: ReactNode }) {
  return (
    <PublicMarketingShell active="academy">
      <section className="flex min-h-[55vh] items-center border-b border-gold/35 pt-28 pb-20 md:pt-32">
        <PageContainer wide className="mx-auto w-full max-w-xl text-center">
          <div className="border border-gold/35 p-8 md:p-10">{children}</div>
          <p className="mt-8">
            <Link href="/academy" className={academyLinkBack}>
              ← Back to Academy
            </Link>
          </p>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}

export function AcademySuccessTitle({ children }: { children: ReactNode }) {
  return <h1 className={`${academyHeadline} text-2xl`}>{children}</h1>
}

export function AcademySuccessMessage({ children }: { children: ReactNode }) {
  return <p className={`${academyBody} mt-4`}>{children}</p>
}

export { academyBtnPrimary, academyBtnSecondary, academyLinkBack }
