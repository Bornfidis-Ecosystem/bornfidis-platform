import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getChefPerformanceMetrics } from '@/lib/chef-performance'
import { getEarnedBadgesForUser } from '@/lib/badges'
import { BadgeStrip } from '@/components/BadgeStrip'
import { ChefPerformanceClient } from '@/app/chef/performance/ChefPerformanceClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2N — Admin: View a specific chef's performance by Prisma User.id.
 * ADMIN/STAFF only (layout guard).
 */
export default async function AdminChefPerformancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: chefId } = await params

  const chef = await db.user.findUnique({
    where: { id: chefId },
    select: { id: true, name: true, email: true },
  })
  if (!chef) notFound()

  const [metrics, earnedBadges] = await Promise.all([
    getChefPerformanceMetrics(chefId, { lastJobsLimit: 10 }),
    getEarnedBadgesForUser(chefId),
  ])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Chef performance</h1>
        <p className="text-sm text-gray-500 mt-1">
          {chef.name || 'Chef'} {chef.email ? `(${chef.email})` : ''}
        </p>
      </div>

      {earnedBadges.length > 0 && (
        <BadgeStrip badges={earnedBadges} title="Badges" compact />
      )}

      <ChefPerformanceClient metrics={metrics} />

      <div className="flex gap-4">
        <Link href="/admin/chefs/performance" className="text-sm text-green-700 hover:underline">
          ← All chefs performance
        </Link>
        <Link href="/admin/chefs" className="text-sm text-gray-600 hover:underline">
          Chef network
        </Link>
      </div>
    </div>
  )
}
