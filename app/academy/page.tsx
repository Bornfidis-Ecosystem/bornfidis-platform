import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAcademyProductBySlug,
  type AcademyProduct,
} from '@/lib/academy-products'
import { AcademyFeaturedGrid } from '@/components/academy/AcademyFeaturedGrid'
import { AcademyViewTracker } from '@/components/academy/AcademyViewTracker'
import { TrustStrip } from '@/components/ui/TrustStrip'
import { getAcademyStats } from '@/lib/academy-stats'

export const dynamic = 'force-dynamic'

const ACADEMY_TITLE = 'Bornfidis Academy | Structured Operating Systems for Entrepreneurs, Farmers, Chefs, and Contractors'
const ACADEMY_DESCRIPTION =
  'Transform chaotic hustle into sustainable enterprise. Discipline-based manuals for Jamaican entrepreneurs, farmers, chefs, and Vermont contractors. $39-79.'

function getAcademyOgImageUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const path = '/academy/covers/regenerative-enterprise-foundations.png'
  if (base && base.startsWith('http')) return `${base.replace(/\/$/, '')}${path}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`
  return path
}

export const metadata: Metadata = {
  title: ACADEMY_TITLE,
  description: ACADEMY_DESCRIPTION,
  openGraph: {
    title: ACADEMY_TITLE,
    description: ACADEMY_DESCRIPTION,
    type: 'website',
    images: [
      {
        url: getAcademyOgImageUrl(),
        width: 1200,
        height: 630,
        alt: 'Regenerative Enterprise Foundations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ACADEMY_TITLE,
    description: ACADEMY_DESCRIPTION,
  },
}

/** Featured manuals in display order (homepage 2x2 grid). */
const FEATURED_SLUGS = [
  'regenerative-enterprise-foundations',
  'regenerative-farmer-blueprint',
  'jamaican-chef-enterprise-system',
  'vermont-contractor-foundations',
]

/** Valid category from URL for initial filter. */
const VALID_CATEGORIES = ['Foundations', 'Farming', 'Culinary', 'Contracting'] as const
type UrlCategory = (typeof VALID_CATEGORIES)[number]
function parseCategory(category: string | undefined): UrlCategory | undefined {
  if (!category) return undefined
  const c = category.trim()
  return VALID_CATEGORIES.includes(c as UrlCategory) ? (c as UrlCategory) : undefined
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AcademyPage({ searchParams }: PageProps) {
  const params = await searchParams
  const categoryParam = typeof params?.category === 'string' ? params.category : undefined
  const initialCategory = parseCategory(categoryParam)

  const products: AcademyProduct[] = FEATURED_SLUGS.map((slug) =>
    getAcademyProductBySlug(slug)
  ).filter((p): p is AcademyProduct => p != null)

  let totalPurchaseCount = 0
  try {
    const stats = await getAcademyStats()
    totalPurchaseCount = stats.totalPaidSales + stats.totalFreeClaims
  } catch {
    // use 0 → component will show 100+ as fallback
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <AcademyViewTracker />
      {/* Hero */}
      <header className="mb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
          Build Regenerative Enterprise in Jamaica — Start Here
        </h1>
        <p className="text-gray-600 mb-1">
          Templates, courses, and tools to grow your business. Clean. Premium.
        </p>
        <p className="text-gray-600">
          Operational systems for regenerative entrepreneurs.
        </p>
        <TrustStrip className="mt-6 mb-2" />
      </header>

      {/* Featured products: category filter + 2x2 grid + social proof + CTA */}
      <section id="featured" className="mb-16">
        <h2 className="sr-only">Featured manuals</h2>
        <AcademyFeaturedGrid
          products={products}
          totalPurchaseCount={totalPurchaseCount}
          initialCategory={initialCategory}
        />
      </section>

      <p className="text-center text-sm text-gray-500 mt-12">
        <Link href="/dashboard/library" className="text-forest hover:underline">
          View your library
        </Link>
        {' · '}
        <Link href="/payments" className="text-forest hover:underline">
          Payment & participation
        </Link>
      </p>
    </main>
  )
}
