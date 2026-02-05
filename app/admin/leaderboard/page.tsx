import Link from 'next/link'
import { getAdminLeaderboard, getLeaderboardCalculatedAt } from '@/lib/leaderboard'
import SignOutButton from '@/components/admin/SignOutButton'
import LeaderboardAdminClient from './LeaderboardAdminClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AA — Admin leaderboard: full list, raw data, exclude option.
 */
export default async function AdminLeaderboardPage() {
  const [rows, calculatedAt] = await Promise.all([
    getAdminLeaderboard(),
    getLeaderboardCalculatedAt(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="text-[#FFBC00] hover:underline text-sm mb-2 inline-block"
              >
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-green-100 text-sm mt-1">
                Score: Rating 40%, On-time 25%, Prep 20%, Jobs 15%. ≥5 jobs in last 90 days. Excluded chefs listed separately.
              </p>
              {calculatedAt && (
                <p className="text-green-200/90 text-xs mt-1">
                  Last recalculated: {new Date(calculatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <LeaderboardAdminClient
          rows={rows}
          calculatedAt={calculatedAt}
        />
      </main>
    </div>
  )
}
