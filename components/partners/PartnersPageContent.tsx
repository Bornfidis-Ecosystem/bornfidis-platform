import Link from 'next/link'

import { HomeRoyalCaribbeanDifference } from '@/components/home/HomeRoyalCaribbeanDifference'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { PageContainer } from '@/components/ui/PageContainer'
import { PARTNERS_HERO, PARTNERS_OFFERS } from '@/lib/partners-content'
import {
  bookBody,
  bookEyebrow,
  bookHeadline,
  bookSection,
} from '@/components/booking/book-culinary-classes'

export default function PartnersPageContent() {
  return (
    <PublicMarketingShell>
      <section className={`${bookSection} pt-28 md:pt-32`}>
        <PageContainer wide>
          <p className={bookEyebrow}>{PARTNERS_HERO.eyebrow}</p>
          <h1 className={`${bookHeadline} mt-3 max-w-3xl`}>{PARTNERS_HERO.title}</h1>
          <p className={`${bookBody} mt-6 max-w-2xl`}>{PARTNERS_HERO.body}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton theme="culinary" href={PARTNERS_HERO.contactPresetHref}>
              Start a conversation
            </PrimaryButton>
            <Link
              href={PARTNERS_HERO.cta.href}
              className="inline-flex min-h-[48px] items-center font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] underline decoration-[#ffbc00]/50 underline-offset-4"
            >
              General contact
            </Link>
          </div>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <p className={bookEyebrow}>What we offer</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PARTNERS_OFFERS.map((offer) => (
              <article
                key={offer.title}
                className="border border-[#ffbc00]/35 bg-[#faf6f0] p-6 shadow-none md:p-8"
              >
                <h2 className="font-display text-xl font-semibold text-[#002747]">{offer.title}</h2>
                <p className={`${bookBody} mt-4 text-sm`}>{offer.description}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <div className="bf-home">
        <HomeRoyalCaribbeanDifference />
      </div>

      <section className={`${bookSection} pb-20`}>
        <PageContainer wide className="text-center">
          <p className={bookEyebrow}>Next step</p>
          <h2 className={`${bookHeadline} mt-3`}>Tell us what you&apos;re building.</h2>
          <p className={`${bookBody} mx-auto mt-4 max-w-xl`}>
            Investors, operators, and brand partners — one short inquiry and we&apos;ll follow up within
            48 hours.
          </p>
          <PrimaryButton theme="culinary" href={PARTNERS_HERO.contactPresetHref} className="mt-8">
            Contact Bornfidis
          </PrimaryButton>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
