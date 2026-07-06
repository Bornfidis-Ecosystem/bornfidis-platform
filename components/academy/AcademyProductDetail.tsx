import Image from 'next/image'
import Link from 'next/link'

import AcademyBuyButton from '@/components/academy/AcademyBuyButton'
import { AcademyProductViewTracker } from '@/components/academy/AcademyProductViewTracker'
import {
  academyBody,
  academyCard,
  academyEyebrow,
  academyHeadline,
  academyLinkBack,
  academySection,
} from '@/components/academy/academy-culinary-classes'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { PageContainer } from '@/components/ui/PageContainer'
import type { AcademyProduct } from '@/lib/academy-products'

const TESTIMONIAL_PLACEHOLDERS = [
  {
    quote: 'The pricing formula alone changed how I run my business. I finally charge what I’m worth.',
    name: 'Maria P.',
    role: 'Portland farmer',
  },
  {
    quote: 'Weekly rhythm gave me visibility I never had. I know my numbers every Friday now.',
    name: 'Marcus T.',
    role: 'Kingston caterer',
  },
  {
    quote: 'Parish-first focus kept me from expanding too fast. I’m profitable in one market before adding the next.',
    name: 'Devon R.',
    role: 'Montego Bay taxi operator',
  },
  {
    quote: 'The reputation covenant is on my wall. I don’t overpromise anymore.',
    name: 'Keisha M.',
    role: 'Spanish Town boutique owner',
  },
  {
    quote: '90-day covenant gave me structure when I was about to quit. Finished it and doubled my reserve.',
    name: 'Andre L.',
    role: 'Clarendon contractor',
  },
] as const

const FAQ_ITEMS = [
  {
    q: 'How do I access the manual after purchase?',
    a: "Immediately after purchase, you'll receive an email with a download link. You can also access it anytime from your My Library page.",
  },
  {
    q: 'Is this a physical book or digital?',
    a: 'This is a digital PDF manual. You can read it on any device or print it for offline use.',
  },
  {
    q: 'Do I get updates?',
    a: 'Yes, you get lifetime access. Any updates or new templates are delivered automatically.',
  },
  {
    q: "What if I'm not satisfied?",
    a: "We offer a 90-day money-back guarantee. If you implement the systems and don't see results, we'll refund your purchase.",
  },
] as const

function getAudienceLabel(category: string): string {
  switch (category) {
    case 'Foundations':
      return 'entrepreneurs'
    case 'Farming':
      return 'farmers'
    case 'Contracting':
      return 'contractors'
    case 'Culinary':
      return 'chefs'
    default:
      return 'builders'
  }
}

function hasRichDetail(product: AcademyProduct): boolean {
  return Boolean(
    product.subtitle ||
      (product.targetAudience && product.targetAudience.length > 0) ||
      (product.learningOutcomes && product.learningOutcomes.length > 0) ||
      (product.whatIsIncluded && product.whatIsIncluded.length > 0)
  )
}

type AcademyProductDetailProps = {
  product: AcademyProduct
  purchaseCount: number | null
}

export function AcademyProductDetail({ product, purchaseCount }: AcademyProductDetailProps) {
  const rich = hasRichDetail(product)
  const audienceLabel = getAudienceLabel(product.category)
  const socialProofLine =
    purchaseCount != null && purchaseCount > 0
      ? `Join ${purchaseCount}+ ${audienceLabel} who have transformed their business.`
      : `Join hundreds of ${audienceLabel} who have transformed their business.`

  return (
    <PublicMarketingShell active="academy">
      <AcademyProductViewTracker
        slug={product.slug}
        title={product.title}
        priceDisplay={product.priceDisplay}
        category={product.category}
      />
      <section className={`${academySection} border-t-0 pt-28 md:pt-32`}>
        <PageContainer wide>
          <Link href="/academy" className={academyLinkBack}>
            ← Back to Academy
          </Link>

          {!rich ? (
            <article className={`${academyCard} mt-6 max-w-3xl`}>
              <div className="relative aspect-video bg-[#1a1a1a]/5">
                {product.image ? (
                  <Image src={product.image} alt="" fill className="object-cover" sizes="896px" priority />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-6xl text-[#1a1a1a]/25">
                    {product.title.charAt(0)}
                  </div>
                )}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="bg-[#002747] px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#faf6f0]">
                    {product.category}
                  </span>
                  {product.type !== 'DOWNLOAD' ? (
                    <span className="border border-[#ffbc00]/50 bg-[#faf6f0] px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]">
                      {product.type === 'COURSE' ? 'Course' : 'Bundle'}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="border-t border-[#ffbc00]/25 p-8">
                <h1 className={`${academyHeadline} text-2xl`}>{product.title}</h1>
                <p className={`${academyBody} mt-4`}>{product.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="font-display text-xl text-[#1a1a1a]">{product.priceDisplay}</span>
                  <AcademyBuyButton product={product} size="lg" />
                </div>
                <p className={`${academyBody} mt-4 text-sm`}>
                  One-time purchase. Download from your library after purchase.
                </p>
              </div>
            </article>
          ) : (
            <>
              <section className="mt-8 grid grid-cols-1 items-start gap-10 md:grid-cols-5 md:gap-12">
                <div className="relative aspect-[3/4] max-w-sm overflow-hidden border border-[#ffbc00]/35 md:col-span-2">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="320px"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-5xl text-[#1a1a1a]/25">
                      {product.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="md:col-span-3">
                  <p className={academyEyebrow}>{product.category}</p>
                  <h1 className={`${academyHeadline} mt-3 text-3xl md:text-4xl`}>{product.title}</h1>
                  {product.subtitle ? <p className={`${academyBody} mt-3`}>{product.subtitle}</p> : null}
                  <p className="mt-6 font-display text-2xl text-[#1a1a1a]">{product.priceDisplay}</p>
                  <div className="mt-6">
                    <AcademyBuyButton product={product} size="lg" />
                  </div>
                  <p className={`${academyBody} mt-4 text-sm`}>
                    One-time purchase. Download from your library after purchase.
                  </p>
                </div>
              </section>

              <section className="mt-16 max-w-3xl">
                <h2 className={`${academyHeadline} text-xl`}>About this manual</h2>
                <p className={`${academyBody} mt-4`}>{product.description}</p>

                {product.targetAudience && product.targetAudience.length > 0 ? (
                  <div className="mt-10">
                    <h3 className="font-display text-lg text-[#1a1a1a]">Who this is for</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {product.targetAudience.map((aud) => (
                        <li
                          key={aud}
                          className="border border-[#ffbc00]/35 px-3 py-1.5 font-sans text-sm text-[#1a1a1a]"
                        >
                          {aud}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {product.learningOutcomes && product.learningOutcomes.length > 0 ? (
                  <div className="mt-10">
                    <h3 className="font-display text-lg text-[#1a1a1a]">What you&apos;ll learn</h3>
                    <ul className={`${academyBody} mt-3 list-disc space-y-2 pl-5 text-sm`}>
                      {product.learningOutcomes.map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {product.whatIsIncluded && product.whatIsIncluded.length > 0 ? (
                  <div className="mt-10">
                    <h3 className="font-display text-lg text-[#1a1a1a]">What&apos;s included</h3>
                    <ul className={`${academyBody} mt-3 list-disc space-y-2 pl-5 text-sm`}>
                      {product.whatIsIncluded.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section className="mt-16">
                <p className={`${academyBody} mb-8 text-center text-lg`}>{socialProofLine}</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {TESTIMONIAL_PLACEHOLDERS.slice(0, 5).map((t, i) => (
                    <blockquote key={i} className={`${academyCard} p-6`}>
                      <p className={`${academyBody} text-sm italic`}>&ldquo;{t.quote}&rdquo;</p>
                      <footer className="mt-4 font-sans text-sm font-semibold text-[#1a1a1a]">
                        {t.name} — {t.role}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </section>

              <section className="mt-16 max-w-3xl">
                <h2 className={`${academyHeadline} text-xl`}>Frequently asked questions</h2>
                <dl className="mt-6 space-y-6">
                  {FAQ_ITEMS.map((faq) => (
                    <div key={faq.q} className="border-b border-[#ffbc00]/25 pb-6 last:border-0">
                      <dt className="font-display text-lg text-[#1a1a1a]">{faq.q}</dt>
                      <dd className={`${academyBody} mt-2 text-sm`}>{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="mt-16 border border-[#ffbc00]/35 p-8 text-center md:p-12">
                <h2 className={academyHeadline}>Ready to build with structure?</h2>
                <p className="mt-4 font-display text-3xl text-[#1a1a1a]">{product.priceDisplay}</p>
                <AcademyBuyButton product={product} size="lg" className="mt-8 justify-center" />
                <p className={`${academyBody} mt-4 text-sm`}>Secure checkout · Instant access</p>
              </section>
            </>
          )}
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
