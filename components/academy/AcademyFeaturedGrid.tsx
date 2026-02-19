'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { AcademyProduct } from '@/lib/academy-products'

const FEATURED_CATEGORIES = ['All Products', 'Foundations', 'Farming', 'Culinary', 'Contracting'] as const
type FilterCategory = (typeof FEATURED_CATEGORIES)[number]

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
  /** Initial category filter from URL (e.g. /academy?category=Foundations) */
  initialCategory?: string
}

export function AcademyFeaturedGrid({ products, totalPurchaseCount, initialCategory }: AcademyFeaturedGridProps) {
  const [filter, setFilter] = useState<FilterCategory>(
    initialCategory && FEATURED_CATEGORIES.includes(initialCategory as FilterCategory)
      ? (initialCategory as FilterCategory)
      : 'All Products'
  )

  const filtered =
    filter === 'All Products'
      ? products
      : products.filter((p) => p.category === filter)

  const displayCount = Math.max(totalPurchaseCount, 100)
  const socialProofText = `Join ${displayCount}+ entrepreneurs, farmers, and chefs building sustainable enterprise`

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {FEATURED_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out ${
              filter === cat
                ? 'bg-forest text-goldAccent'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
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
                  {product.category}
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-forest/80 mb-1">
                  {CARD_TAGLINE[product.slug] ?? product.category}
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
                  Learn More
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
          Start with the Foundations manual ($39) or choose the manual for your industry.
        </p>
        <Link
          href="/academy/regenerative-enterprise-foundations"
          className="inline-flex items-center justify-center bg-forest text-goldAccent font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-200 ease-in-out"
        >
          View Foundations ($39)
        </Link>
        <span className="mx-3 text-gray-400">·</span>
        <Link
          href="/academy#featured"
          className="inline-flex items-center justify-center border-2 border-forest text-forest font-semibold px-8 py-3 rounded-xl hover:bg-forest/10 transition-all duration-200 ease-in-out"
        >
          Browse all manuals
        </Link>
      </div>
    </>
  )
}
