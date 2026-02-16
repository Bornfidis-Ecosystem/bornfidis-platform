import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChefById } from '../actions'
import { getChefTierAndMultiplier } from '@/lib/chef-tier'
import { getReviewsForChef, getReviewStatsForChef } from '@/lib/reviews'
import { getChefFeaturedStatus } from '@/lib/featured-chefs'
import SignOutButton from '@/components/admin/SignOutButton'
import ChefTierOverrideForm from './ChefTierOverrideForm'
import ChefFeaturedSection from './ChefFeaturedSection'
import ChefReviewsSection from './ChefReviewsSection'
import ResendStatementForm from './ResendStatementForm'
import ResendTaxSummaryForm from './ResendTaxSummaryForm'
import ChefPayoutCurrencySection from './ChefPayoutCurrencySection'
import { db } from '@/lib/db'

/**
 * Phase 2S: Admin chef detail — tier + override.
 * Phase 2U: Reviews section with hide/unhide.
 * Chef id = Supabase chefs.id (treated as userId for Prisma ChefProfile).
 */
export default async function AdminChefDetailPage({ params }: { params: { id: string } }) {
  const { success, chef, error } = await getChefById(params.id)
  if (!success || !chef) notFound()

  const [tierInfo, featuredStatus, reviewStats, reviewList] = await Promise.all([
    getChefTierAndMultiplier(params.id),
    getChefFeaturedStatus(params.id),
    getReviewStatsForChef(params.id),
    getReviewsForChef(params.id, { includeHidden: true, limit: 50 }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/chefs" className="text-gold hover:underline text-sm mb-2 inline-block">
                ← Chef Network
              </Link>
              <h1 className="text-2xl font-bold">{chef.name}</h1>
              <p className="text-green-100 text-sm mt-1">{chef.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Rate tier (Phase 2S)</h2>
            <p className="text-sm text-gray-600 mb-2">
              Current: <strong>{tierInfo.tier}</strong> — ×{tierInfo.rateMultiplier}
              {tierInfo.isOverridden && <span className="text-amber-600 ml-1">(admin override)</span>}
            </p>
            <ChefTierOverrideForm chefId={params.id} currentOverride={tierInfo.isOverridden ? tierInfo.tier : null} />
          </section>
          <ChefFeaturedSection
            chefId={params.id}
            initialFeatured={featuredStatus.featured}
            initialAdminOverride={featuredStatus.adminOverride}
            eligibility={featuredStatus.eligibility}
          />
          <ResendStatementForm chefId={params.id} />
          <ResendTaxSummaryForm chefId={params.id} />
          <ChefPayoutCurrencySection
            chefId={params.id}
            preferredCurrency={chefProfile?.preferredPayoutCurrency ?? null}
            overrideCurrency={chefProfile?.payoutCurrencyOverride ?? null}
          />
          <ChefReviewsSection chefId={params.id} stats={reviewStats} reviews={reviewList} />
          <p className="text-sm text-gray-500 space-x-4">
            <Link href={`/admin/chefs/${params.id}/availability`} className="text-forestDark hover:underline">
              Availability →
            </Link>
            <Link href={`/admin/chefs/${params.id}/performance`} className="text-forestDark hover:underline">
              View performance →
            </Link>
            <Link href={`/admin/chefs/${params.id}/earnings`} className="text-forestDark hover:underline">
              Earnings projections →
            </Link>
            <Link href={`/admin/incidents?chefId=${params.id}`} className="text-forestDark hover:underline">
              Incidents →
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

