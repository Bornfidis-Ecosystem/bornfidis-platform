import type { Metadata } from 'next'
import BrutalistBookingNav from '@/components/layout/BrutalistBookingNav'
import { ExperienceHero } from '@/components/experience/ExperienceHero'
import { ExperienceIncludes } from '@/components/experience/ExperienceIncludes'
import { ExperienceProcess } from '@/components/experience/ExperienceProcess'
import { ExperienceTrustSection } from '@/components/experience/ExperienceTrustSection'
import { ExperiencePageCta } from '@/components/experience/ExperiencePageCta'

export const metadata: Metadata = {
  title: 'The Experience | Bornfidis Provisions',
  description: 'Private dining shaped by intention, hospitality, and refined execution.',
}

export default function ExperiencePage() {
  return (
    <div className="home-brutalist-root min-h-screen bg-midnight text-cream">
      <BrutalistBookingNav />
      <ExperienceHero />
      <ExperienceIncludes />
      <ExperienceProcess />
      <ExperienceTrustSection />
      <ExperiencePageCta />
    </div>
  )
}
