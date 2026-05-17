import type { Metadata } from 'next'

import { ExperienceHero } from '@/components/experience/ExperienceHero'
import { ExperienceIncludes } from '@/components/experience/ExperienceIncludes'
import { ExperienceSignatureMoment } from '@/components/experience/ExperienceSignatureMoment'
import { ExperienceProcess } from '@/components/experience/ExperienceProcess'
import { ExperienceTrustSection } from '@/components/experience/ExperienceTrustSection'
import { ExperiencePageCta } from '@/components/experience/ExperiencePageCta'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'

export const metadata: Metadata = {
  title: 'The Experience | Bornfidis Provisions',
  description: 'Private dining shaped by intention, hospitality, and refined execution.',
}

export default function ExperiencePage() {
  return (
    <PublicMarketingShell active="experience">
      <ExperienceHero />
      <ExperienceIncludes />
      <ExperienceSignatureMoment />
      <ExperienceProcess />
      <ExperienceTrustSection />
      <ExperiencePageCta />
    </PublicMarketingShell>
  )
}
