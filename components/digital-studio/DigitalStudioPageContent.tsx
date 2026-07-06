import Link from 'next/link'

import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import {
  bookBody,
  bookEyebrow,
  bookHeadline,
  bookSection,
} from '@/components/booking/book-culinary-classes'
import {
  DIGITAL_STUDIO_AUDIENCE,
  DIGITAL_STUDIO_BUILT_FOR,
  DIGITAL_STUDIO_FORM,
  DIGITAL_STUDIO_HERO,
  DIGITAL_STUDIO_PILOT,
  DIGITAL_STUDIO_SYSTEM,
} from '@/lib/digital-studio-content'

import { DigitalStudioApplicationForm } from './DigitalStudioApplicationForm'

export default function DigitalStudioPageContent() {
  return (
    <PublicMarketingShell>
      <section className={`${bookSection} border-t-0 pt-28 md:pt-32`}>
        <PageContainer wide>
          <p className={bookEyebrow}>{DIGITAL_STUDIO_HERO.eyebrow}</p>
          <h1 className={`${bookHeadline} mt-3 max-w-4xl`}>{DIGITAL_STUDIO_HERO.headline}</h1>
          <p className={`${bookBody} mt-6 max-w-2xl`}>{DIGITAL_STUDIO_HERO.subhead}</p>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <h2 className="font-display text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-snug text-[#002747]">
            {DIGITAL_STUDIO_BUILT_FOR.title}
          </h2>
          <p className={`${bookBody} mt-6 max-w-3xl`}>{DIGITAL_STUDIO_BUILT_FOR.body}</p>
          <Link
            href={DIGITAL_STUDIO_BUILT_FOR.platformHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#002747] underline decoration-[#ffbc00]/60 underline-offset-4 transition-colors hover:text-[#1a1a1a]"
          >
            {DIGITAL_STUDIO_BUILT_FOR.platformLinkLabel} →
          </Link>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <h2 className="font-display text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-snug text-[#002747]">
            {DIGITAL_STUDIO_SYSTEM.title}
          </h2>
          <p className={`${bookBody} mt-6 max-w-2xl`}>{DIGITAL_STUDIO_SYSTEM.intro}</p>
          <ul className={`${bookBody} mt-6 max-w-2xl list-disc space-y-3 pl-5`}>
            {DIGITAL_STUDIO_SYSTEM.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={`${bookBody} mt-6 max-w-2xl font-medium text-[#1a1a1a]`}>
            {DIGITAL_STUDIO_SYSTEM.closing}
          </p>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <h2 className="font-display text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-snug text-[#002747]">
            {DIGITAL_STUDIO_AUDIENCE.title}
          </h2>
          <ul className={`${bookBody} mt-6 max-w-2xl list-disc space-y-3 pl-5`}>
            {DIGITAL_STUDIO_AUDIENCE.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <h2 className="font-display text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-snug text-[#002747]">
            {DIGITAL_STUDIO_PILOT.title}
          </h2>
          <p className={`${bookBody} mt-6 max-w-2xl`}>{DIGITAL_STUDIO_PILOT.body}</p>
          <PrimaryButton theme="culinary" href="#apply" className="mt-8">
            {DIGITAL_STUDIO_PILOT.applyLabel}
          </PrimaryButton>
        </PageContainer>
      </section>

      <section id="apply" className={`${bookSection} scroll-mt-28 pb-24 md:scroll-mt-32`}>
        <PageContainer wide>
          <p className={bookEyebrow}>{DIGITAL_STUDIO_FORM.title}</p>
          <h2 className={`${bookHeadline} mt-3 max-w-2xl`}>{DIGITAL_STUDIO_PILOT.applyLabel}</h2>
          <div className="mt-10 max-w-3xl">
            <DigitalStudioApplicationForm />
          </div>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
