import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getChefPerformanceMetrics } from '@/lib/chef-performance'
import { getReviewSummaryForChef } from '@/lib/review-analytics'
import { getEarnedBadgesForUser } from '@/lib/badges'
import { BadgeStrip } from '@/components/BadgeStrip'
import { ChefPerformanceClient } from './ChefPerformanceClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2N — Chef Performance (read-only). CHEF sees only their metrics.
 */
export default async function ChefPerformancePage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const [metrics, earnedBadges] = await Promise.all([
    getChefPerformanceMetrics(user.id, { lastJobsLimit: 10 }),
    getEarnedBadgesForUser(user.id),
  ])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Performance</h1>
      <p className="text-sm text-gray-500">
        Objective feedback from your booking history. Read-only; numbers update as jobs complete.
      </p>

      {earnedBadges.length > 0 && (
        <BadgeStrip badges={earnedBadges} title="Badges" compact />
      )}

      <ChefPerformanceClient metrics={metrics} reviewSummary={reviewSummary} />

      <Link href="/chef" className="text-sm text-green-700 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  )
}
