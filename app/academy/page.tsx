/**
 * Commerce layer — Academy (digital products).
 * Products are loaded from the database (active only, ordered by featured then updatedAt).
 */
import type { Metadata } from 'next'
import Link from 'next/link'

import { AcademyEmailCapture } from '@/components/academy/AcademyEmailCapture'
import { AcademyFeaturedGrid } from '@/components/academy/AcademyFeaturedGrid'
import { AcademyViewTracker } from '@/components/academy/AcademyViewTracker'
import {
  academyBody,
  academyEyebrow,
  academyHeadline,
  academySection,
} from '@/components/academy/academy-culinary-classes'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { PageContainer } from '@/components/ui/PageContainer'
import { TrustStrip } from '@/components/ui/TrustStrip'
import { getAcademyProductsFromDb } from '@/lib/academy-products-public'
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

  const products = await getAcademyProductsFromDb()

  let totalPurchaseCount = 0
  try {
    const stats = await getAcademyStats()
    totalPurchaseCount = stats.totalPaidSales + stats.totalFreeClaims
  } catch {
    // use 0 → component will show 100+ as fallback
  }

  return (
    <PublicMarketingShell active="academy">
      <AcademyViewTracker />
      <section className={`${academySection} border-t-0 pt-28 md:pt-32`}>
        <PageContainer wide>
          <header className="mb-14 text-center">
            <p className={academyEyebrow}>Bornfidis Academy</p>
            <h1 className={`${academyHeadline} mx-auto mt-4 max-w-4xl text-[clamp(2rem,5vw,3.25rem)]`}>
              Structured Operating Systems for Entrepreneurs, Farmers &amp; Chefs
            </h1>
            <p className={`${academyBody} mx-auto mt-6 max-w-2xl`}>
              Discipline-based manuals and templates. One-time purchase, lifetime access. Build sustainable
              enterprise with clear systems and rhythms.
            </p>
            <TrustStrip variant="culinary" className="mt-8" />
          </header>

          <section id="featured" className="mb-16">
            <h2 className="sr-only">Academy products</h2>
            {products.length === 0 ? (
              <div className="border border-[#C9A84C]/35 p-12 text-center">
                <p className={`${academyHeadline} text-xl`}>No products available yet</p>
                <p className={`${academyBody} mt-3 text-sm`}>
                  New guides and courses will appear here. Check back soon or browse the free guide below.
                </p>
                <Link
                  href="/guide/5-caribbean-sauces"
                  className="mt-6 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] no-underline hover:text-[#2c2c2c]"
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

          <p className={`${academyBody} mb-8 text-center text-sm`}>
            <Link
              href="/guide/5-caribbean-sauces"
              className="font-semibold text-[#C9A84C] no-underline hover:text-[#2c2c2c]"
            >
              New: Get our free guide — 5 Caribbean Sauces
            </Link>
          </p>

          <AcademyEmailCapture />

          <p className={`${academyBody} mt-12 text-center text-sm`}>
            <Link href="/dashboard/library" className="text-[#C9A84C] no-underline hover:text-[#2c2c2c]">
              View your library
            </Link>
            {' · '}
            <Link href="/payments" className="text-[#C9A84C] no-underline hover:text-[#2c2c2c]">
              Payment &amp; participation
            </Link>
          </p>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
