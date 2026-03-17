/**
 * Commerce layer — Academy (digital products).
 * Products are loaded from the database (active only, ordered by featured then updatedAt).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAcademyProductsFromDb } from '@/lib/academy-products-public'
import { AcademyFeaturedGrid } from '@/components/academy/AcademyFeaturedGrid'
import { AcademyEmailCapture } from '@/components/academy/AcademyEmailCapture'
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

/** Valid pillar slugs from URL for initial filter (docs/ACADEMY_KNOWLEDGE_MAP.md). */
const VALID_PILLARS = ['food-systems', 'clothing-craft', 'housing-infrastructure', 'education-enterprise'] as const
type UrlPillar = (typeof VALID_PILLARS)[number]
function parsePillar(pillar: string | undefined): UrlPillar | undefined {
  if (!pillar) return undefined
  const p = pillar.trim().toLowerCase()
  return VALID_PILLARS.includes(p as UrlPillar) ? (p as UrlPillar) : undefined
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AcademyPage({ searchParams }: PageProps) {
  const params = await searchParams
  const pillarParam = typeof params?.pillar === 'string' ? params.pillar : undefined
  const initialPillar = parsePillar(pillarParam)

  let products = await getAcademyProductsFromDb()

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
          Structured Operating Systems for Entrepreneurs, Farmers & Chefs
        </h1>
        <p className="text-gray-600 mb-1">
          Get access to discipline-based manuals and templates. One-time purchase, lifetime access.
        </p>
        <p className="text-gray-600">
          Build sustainable enterprise with clear systems and rhythms.
        </p>
        <TrustStrip className="mt-6 mb-2" />
      </header>

      {/* Products: category filter + grid + social proof + CTA (or empty state) */}
      <section id="featured" className="mb-16">
        <h2 className="sr-only">Academy products</h2>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg font-medium text-forest mb-2">No products available yet</p>
            <p className="text-gray-600 text-sm">
              New guides and courses will appear here. Check back soon or browse the free guide below.
            </p>
            <Link
              href="/guide/5-caribbean-sauces"
              className="inline-block mt-4 text-forest font-semibold hover:underline"
            >
              Get the free guide — 5 Caribbean Sauces →
            </Link>
          </div>
        ) : (
          <AcademyFeaturedGrid
            products={products}
            totalPurchaseCount={totalPurchaseCount}
            initialPillar={initialPillar}
          />
        )}
      </section>

      {/* Free guide CTA */}
      <p className="text-center text-sm text-forest mb-4">
        <Link href="/guide/5-caribbean-sauces" className="hover:underline font-medium">
          New: Get our free guide — 5 Caribbean Sauces
        </Link>
      </p>

      {/* Email capture */}
      <section className="max-w-2xl mx-auto mt-14 mb-12">
        <AcademyEmailCapture />
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
