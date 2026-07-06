import type { ReactNode } from 'react'

import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { PageContainer } from '@/components/ui/PageContainer'

export function ThanksPageShell({ children }: { children: ReactNode }) {
  return (
    <PublicMarketingShell>
      <section className="flex min-h-[55vh] items-center border-b border-[#ffbc00]/35 pt-28 pb-20 md:pt-32 md:pb-24">
        <PageContainer wide className="mx-auto w-full max-w-2xl">
          <div className="border border-[#ffbc00]/35 bg-[#faf6f0] p-8 md:p-10">{children}</div>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
