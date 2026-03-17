'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ACADEMY_PILLARS, type AcademyProduct, type AcademyPillarSlug } from '@/lib/academy-products'

/** Short tagline for homepage cards (by slug). */
const CARD_TAGLINE: Record<string, string> = {
  'regenerative-enterprise-foundations': 'For All Entrepreneurs',
  'regenerative-farmer-blueprint': 'For Farmers',
  'jamaican-chef-enterprise-system': 'For Chefs',
  'vermont-contractor-foundations': 'For Contractors',
}

interface AcademyFeaturedGridProps {
  products: AcademyProduct[]
  totalPurchaseCount: number
  /** Initial pillar filter from URL (e.g. /academy?pillar=food-systems) */
  initialPillar?: string
}

export function AcademyFeaturedGrid({ products, totalPurchaseCount, initialPillar }: AcademyFeaturedGridProps) {
  const validPillar = (value: string): value is AcademyPillarSlug =>
    ACADEMY_PILLARS.some((p) => p.slug === value)
  const [pillarFilter, setPillarFilter] = useState<AcademyPillarSlug | 'all'>(
    initialPillar && validPillar(initialPillar) ? initialPillar : 'all'
  )

  const filtered =
    pillarFilter === 'all'
      ? products
      : products.filter((p) => p.pillar === pillarFilter)

  const displayCount = Math.max(totalPurchaseCount, 100)
  const socialProofText = `Join ${displayCount}+ entrepreneurs, farmers, and chefs building sustainable enterprise`

  const pillarLabel = (slug: AcademyPillarSlug) => ACADEMY_PILLARS.find((p) => p.slug === slug)?.label ?? slug

  return (
    <>
      {/* Browse by pillar */}
      <div className="mb-8">
        <p className="text-center text-sm font-medium text-gray-600 mb-3">Browse by pillar</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            key="all"
            type="button"
            onClick={() => setPillarFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out ${
              pillarFilter === 'all'
                ? 'bg-forest text-goldAccent'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {ACADEMY_PILLARS.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setPillarFilter(p.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out ${
                pillarFilter === p.slug
                  ? 'bg-forest text-goldAccent'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid: 2x2 desktop, 1 col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        {filtered.map((product) => (
          <article
            key={product.slug}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md"
          >
            <Link href={`/academy/${product.slug}`} className="block">
              <div className="aspect-[3/4] md:aspect-[4/3] bg-card relative">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-forest text-4xl font-bold opacity-30">
                    {product.title.charAt(0)}
                  </div>
                )}
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-forest text-goldAccent">
                  {pillarLabel(product.pillar)}
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-forest/80 mb-1">
                  {CARD_TAGLINE[product.slug] ?? pillarLabel(product.pillar)}
                </p>
                <h2 className="text-xl font-bold text-forest mb-1">{product.title}</h2>
                {product.subtitle && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.subtitle}
                  </p>
                )}
                <p className="text-lg font-semibold text-forest mb-4">
                  {product.priceDisplay}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest group-hover:underline">
                  Get Access
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Social proof */}
      <p className="text-center text-lg text-forest font-medium mb-12">
        {socialProofText}
      </p>

      {/* CTA */}
      <div className="text-center rounded-2xl border-2 border-forest/20 bg-forest/5 p-8">
        <p className="text-gray-700 mb-4">
          Start with the Foundations manual or choose the guide for your industry.
        </p>
        <Link
          href="/academy/regenerative-enterprise-foundations"
          className="inline-flex items-center justify-center bg-forest text-goldAccent font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-200 ease-in-out"
        >
          Get Access — Foundations ($39)
        </Link>
        <span className="mx-3 text-gray-400">·</span>
        <Link
          href="/academy#featured"
          className="inline-flex items-center justify-center border-2 border-forest text-forest font-semibold px-8 py-3 rounded-xl hover:bg-forest/10 transition-all duration-200 ease-in-out"
        >
          Browse all guides
        </Link>
      </div>
    </>
  )
}
