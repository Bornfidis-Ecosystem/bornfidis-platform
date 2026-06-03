'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import {
  academyBody,
  academyBtnPrimary,
  academyBtnSecondary,
  academyCard,
  academyHeadline,
  academyPillActive,
  academyPillInactive,
} from '@/components/academy/academy-culinary-classes'
import { ACADEMY_PILLARS, type AcademyProduct, type AcademyPillarSlug } from '@/lib/academy-products'

const CARD_TAGLINE: Record<string, string> = {
  'regenerative-enterprise-foundations': 'For All Entrepreneurs',
  'regenerative-farmer-blueprint': 'For Farmers',
  'jamaican-chef-enterprise-system': 'For Chefs',
  'vermont-contractor-foundations': 'For Contractors',
}

interface AcademyFeaturedGridProps {
  products: AcademyProduct[]
  totalPurchaseCount: number
  initialPillar?: string
}

export function AcademyFeaturedGrid({ products, totalPurchaseCount, initialPillar }: AcademyFeaturedGridProps) {
  const validPillar = (value: string): value is AcademyPillarSlug =>
    ACADEMY_PILLARS.some((p) => p.slug === value)
  const [pillarFilter, setPillarFilter] = useState<AcademyPillarSlug | 'all'>(
    initialPillar && validPillar(initialPillar) ? initialPillar : 'all'
  )

  const filtered =
    pillarFilter === 'all' ? products : products.filter((p) => p.pillar === pillarFilter)

  const displayCount = Math.max(totalPurchaseCount, 100)
  const socialProofText = `Join ${displayCount}+ entrepreneurs, farmers, and chefs building sustainable enterprise`

  const pillarLabel = (slug: AcademyPillarSlug) => ACADEMY_PILLARS.find((p) => p.slug === slug)?.label ?? slug

  return (
    <>
      <div className="mb-10">
        <p className={`${academyBody} mb-3 text-center text-sm`}>Browse by pillar</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setPillarFilter('all')}
            className={pillarFilter === 'all' ? academyPillActive : academyPillInactive}
          >
            All
          </button>
          {ACADEMY_PILLARS.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setPillarFilter(p.slug)}
              className={pillarFilter === p.slug ? academyPillActive : academyPillInactive}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2">
        {filtered.map((product) => (
          <article key={product.slug} className={academyCard}>
            <Link href={`/academy/${product.slug}`} className="block no-underline">
              <div className="relative aspect-[3/4] bg-[#2c2c2c]/5 md:aspect-[4/3]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-4xl text-[#2c2c2c]/25">
                    {product.title.charAt(0)}
                  </div>
                )}
                <span className="absolute left-3 top-3 bg-[#1A3C34] px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#fdf8f8]">
                  {pillarLabel(product.pillar)}
                </span>
              </div>
              <div className="border-t border-[#C9A84C]/25 p-6">
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C]">
                  {CARD_TAGLINE[product.slug] ?? pillarLabel(product.pillar)}
                </p>
                <h2 className={`${academyHeadline} mt-2 text-xl`}>{product.title}</h2>
                {product.subtitle ? (
                  <p className={`${academyBody} mt-2 line-clamp-2 text-sm`}>{product.subtitle}</p>
                ) : null}
                <p className="mt-4 font-display text-lg text-[#2c2c2c]">{product.priceDisplay}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/70">
                  Get access →
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <p className={`${academyBody} mb-12 text-center text-lg`}>{socialProofText}</p>

      <div className="border border-[#C9A84C]/35 bg-[#fdf8f8] p-8 text-center">
        <p className={`${academyBody} mb-6 text-sm`}>
          Start with the Foundations manual or choose the guide for your industry.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/academy/regenerative-enterprise-foundations" className={academyBtnPrimary}>
            Get access — Foundations ($39)
          </Link>
          <Link href="/academy#featured" className={academyBtnSecondary}>
            Browse all guides
          </Link>
        </div>
      </div>
    </>
  )
}
