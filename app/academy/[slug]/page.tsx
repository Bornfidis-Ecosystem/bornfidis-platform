import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAcademyProductBySlug } from '@/lib/academy-products'
import { getAcademyStats } from '@/lib/academy-stats'
import AcademyBuyButton from '@/components/academy/AcademyBuyButton'
import { AcademyProductViewTracker } from '@/components/academy/AcademyProductViewTracker'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Placeholder testimonials; replace with real data when available. */
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
]

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
    q: 'What if I\'m not satisfied?',
    a: "We offer a 90-day money-back guarantee. If you implement the systems and don't see results, we'll refund your purchase.",
  },
]

/** Audience label for social proof line by category */
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

export default async function AcademyProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = getAcademyProductBySlug(slug)
  if (!product) notFound()

  const hasRichDetail =
    product.subtitle ||
    (product.targetAudience && product.targetAudience.length > 0) ||
    (product.learningOutcomes && product.learningOutcomes.length > 0) ||
    (product.whatIsIncluded && product.whatIsIncluded.length > 0)

  let purchaseCount: number | null = null
  try {
    const stats = await getAcademyStats()
    const byProduct = stats.revenueByProduct.find((r) => r.slug === slug)
    if (byProduct) purchaseCount = byProduct.sales
  } catch {
    // non-blocking
  }

  if (!hasRichDetail) {
    // Original compact layout for products without rich metadata
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/academy"
          className="text-sm text-forest hover:underline mb-6 inline-block transition-all duration-200 ease-in-out"
        >
          ← Back to Academy
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="aspect-video bg-card relative">
            {product.image ? (
              <Image
                src={product.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-forest text-6xl font-bold opacity-30">
                {product.title.charAt(0)}
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-forest text-goldAccent">
                {product.category}
              </span>
              {product.type !== 'DOWNLOAD' && (
                <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-goldAccent/20 text-forest border border-forest/20">
                  {product.type === 'COURSE' ? 'Course' : 'Bundle'}
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-2xl font-bold text-forest mb-2">{product.title}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xl font-semibold text-forest">
                {product.priceDisplay}
              </span>
              <AcademyBuyButton product={product} size="lg" />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              One-time purchase. No subscription. Access in your library after purchase.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const audienceLabel = getAudienceLabel(product.category)
  const socialProofLine =
    purchaseCount != null && purchaseCount > 0
      ? `Join ${purchaseCount}+ ${audienceLabel} who have transformed their business.`
      : `Join hundreds of ${audienceLabel} who have transformed their business.`

  return (
    <main className="min-h-screen bg-white">
      <AcademyProductViewTracker
        slug={product.slug}
        title={product.title}
        priceDisplay={product.priceDisplay}
        category={product.category}
      />
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        <Link
          href="/academy"
          className="text-sm text-forest hover:underline mb-8 inline-block transition-all duration-200 ease-in-out"
        >
          ← Back to Academy
        </Link>

        {/* Hero: cover (left) + title/subtitle/price/CTA (right) */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start mb-16">
          <div className="md:col-span-2 relative aspect-[3/4] max-w-sm rounded-xl overflow-hidden border border-gray-200 shadow-md bg-card">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-forest text-5xl font-bold opacity-30">
                {product.title.charAt(0)}
              </div>
            )}
          </div>
          <div className="md:col-span-3 flex flex-col justify-center">
            <span className="text-sm font-semibold text-forest/80 uppercase tracking-wide mb-2">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-forest mb-2">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-lg text-gray-600 mb-4">{product.subtitle}</p>
            )}
            <p className="text-2xl font-semibold text-forest mb-6">
              {product.priceDisplay}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <AcademyBuyButton product={product} size="lg" />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              One-time purchase. No subscription. Access in your library after purchase.
            </p>
          </div>
        </section>

        {/* Product Description */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-forest mb-4">About this manual</h2>
          <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>

          {product.targetAudience && product.targetAudience.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-forest mb-3">Who this is for</h3>
              <ul className="flex flex-wrap gap-2">
                {product.targetAudience.map((aud) => (
                  <li
                    key={aud}
                    className="px-3 py-1.5 rounded-full bg-forest/10 text-forest text-sm"
                  >
                    {aud}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.learningOutcomes && product.learningOutcomes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-forest mb-3">What you’ll learn</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {product.learningOutcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {product.whatIsIncluded && product.whatIsIncluded.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-forest mb-3">What’s included</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {product.whatIsIncluded.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Social Proof */}
        <section className="mb-16">
          <p className="text-center text-lg text-forest font-medium mb-8">
            {socialProofLine}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIAL_PLACEHOLDERS.slice(0, 5).map((t, i) => (
              <blockquote
                key={i}
                className="p-6 rounded-xl border border-gray-200 bg-card text-gray-700"
              >
                <p className="text-sm italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <footer className="text-sm font-semibold text-forest">
                  {t.name} — {t.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-forest mb-6">Frequently asked questions</h2>
          <dl className="space-y-6">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6 last:border-0">
                <dt className="text-lg font-semibold text-forest mb-2">{faq.q}</dt>
                <dd className="text-gray-700">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="rounded-2xl border-2 border-forest bg-forest/5 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-forest mb-2">Ready to build with structure?</h2>
          <p className="text-3xl font-semibold text-forest mb-6">{product.priceDisplay}</p>
          <AcademyBuyButton product={product} size="lg" className="justify-center" />
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure checkout via Stripe
            </span>
          </p>
        </section>
      </div>
    </main>
  )
}
