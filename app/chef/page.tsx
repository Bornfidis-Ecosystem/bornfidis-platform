import { getCurrentUserRole } from '@/lib/get-user-role'
import { getPartnerProfileForCurrentUser, getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getEarnedBadgesForUser } from '@/lib/badges'
import { BadgeStrip } from '@/components/BadgeStrip'
import { getChefTierAndMultiplier } from '@/lib/chef-tier'
import { getOpenCasesForChef } from '@/lib/coaching'
import { getChefRank } from '@/lib/leaderboard'
import { getNextUpcomingAssignment, getChefEarningsMonthToDate } from '@/lib/chef-mobile'
import { getChefPerformanceMetrics } from '@/lib/chef-performance'
import { hasRequiredModulesComplete } from '@/lib/education'
import { UserRole } from '@prisma/client'
import { ChefMobileHome } from './ChefMobileHome'

export const dynamic = 'force-dynamic'

/**
 * Phase 2H — Chef Dashboard (concise).
 * Phase 2P — Badge strip at top (earned badges only).
 * Phase 2Z — Coaching banner when action required.
 * Phase 2AE — Mobile-first: next booking, status action, earnings MTD at top.
 */
export default async function ChefDashboard() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')

  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const isChefOnly = String(role).toUpperCase() === 'CHEF'
  const [
    earnedBadges,
    tierInfo,
    openCases,
    leaderboardRank,
    nextBooking,
    earningsCents,
    performance,
    educationComplete,
  ] = await Promise.all([
    getEarnedBadgesForUser(user.id),
    getChefTierAndMultiplier(user.id),
    getOpenCasesForChef(user.id),
    getChefRank(user.id),
    getNextUpcomingAssignment(user.id),
    getChefEarningsMonthToDate(user.id),
    getChefPerformanceMetrics(user.id, { lastJobsLimit: 5 }),
    isChefOnly ? hasRequiredModulesComplete(user.id, UserRole.CHEF) : true,
  ])

  const performanceLine =
    performance.onTimeRatePercent != null || performance.prepCompletionRatePercent != null
      ? [
          performance.onTimeRatePercent != null ? `On-time ${performance.onTimeRatePercent}%` : null,
          performance.prepCompletionRatePercent != null ? `Prep ${performance.prepCompletionRatePercent}%` : null,
        ]
          .filter(Boolean)
          .join(' · ') || null
      : null

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <ChefMobileHome
        nextBooking={nextBooking}
        earningsCents={earningsCents}
        badgeCount={earnedBadges.length}
        performanceLine={performanceLine}
        educationPrompt={isChefOnly && !educationComplete}
      />
      {/* Desktop: full dashboard below */}
      {openCases.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">Action required</p>
          <p className="text-sm text-amber-800 mt-1">
            You have an open coaching follow-up. Please complete the suggested education and improve where noted.
          </p>
          <Link
            href="/chef/education"
            className="inline-block mt-2 text-sm font-medium text-amber-900 underline hover:no-underline"
          >
            Go to Education →
          </Link>
        </div>
      )}
      {earnedBadges.length > 0 && (
        <BadgeStrip badges={earnedBadges} title="Badges" />
      )}
      {tierInfo && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Rate tier</p>
          <p className="text-sm text-gray-900">
            {tierInfo.tier} — {tierInfo.rateMultiplier === 1 ? 'Base rate' : `×${tierInfo.rateMultiplier} (earned)`}
            {tierInfo.isOverridden && <span className="text-amber-600 ml-1">(admin set)</span>}
          </p>
        </div>
      )}
      {leaderboardRank && (
        <div className="rounded-lg border border-[#1a5f3f]/30 bg-green-50 p-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Leaderboard</p>
          <p className="text-sm text-gray-900">
            Rank #{leaderboardRank.rank} of {leaderboardRank.totalOnBoard}
            {leaderboardRank.topPerformer && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FFBC00] text-[#1a5f3f]">
                Top Performer
              </span>
            )}
          </p>
          <Link
            href="/chefs/leaderboard"
            className="text-xs text-[#1a5f3f] font-medium hover:underline mt-1 inline-block"
          >
            View leaderboard →
          </Link>
        </div>
      )}
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          Chef Dashboard — {profile.displayName}
        </h1>
        <p className="text-sm text-gray-500">
          Parish: {profile.parish || 'Not set'}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card
          title="My Profile"
          desc="Kitchen & availability"
          href="/chef/profile"
        />
        <Card
          title="Availability"
          desc="Set when you're available"
          href="/chef/availability"
        />
        <Card
          title="Bookings"
          desc="Upcoming jobs & prep"
          href="/chef/bookings"
        />
        <Card
          title="Education"
          desc="Standards & training"
          href="/chef/education"
        />
        <Card
          title="Payouts"
          desc="Earnings & status"
          href="/chef/payouts"
        />
        <Card
          title="Earnings"
          desc="Projections & planning"
          href="/chef/earnings"
        />
        <Card
          title="Performance"
          desc="On-time, prep & payouts"
          href="/chef/performance"
        />
        <Card
          title="Statements"
          desc="Monthly earnings PDFs"
          href="/chef/statements"
        />
      </section>

      <p className="text-sm text-gray-500">
        <Link href="/partner" className="text-green-700 hover:underline">← Partner home</Link>
      </p>
    </div>
  )
}

function Card({
  title,
  desc,
  href,
}: {
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition block"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </Link>
  )
}
