import Link from 'next/link'
import { getPublicLeaderboard, getLeaderboardCalculatedAt } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AA — Public chef leaderboard (top 10 only).
 * Display: rank, name, badges, star rating, "Top Performer" for top 3. No raw percentages.
 */
export default async function ChefsLeaderboardPage() {
  const [entries, calculatedAt] = await Promise.all([
    getPublicLeaderboard(10),
    getLeaderboardCalculatedAt(),
  ])

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-[#1a5f3f] text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-2">Chef Leaderboard</h1>
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-4" />
          <p className="text-green-100">
            Celebrating excellence. Top 10 chefs by performance (last 90 days).
          </p>
          {calculatedAt && (
            <p className="text-green-200/90 text-sm mt-2">
              Updated {new Date(calculatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            <p>No leaderboard yet. Rankings are updated regularly.</p>
            <Link href="/chefs" className="text-forestDark font-medium mt-2 inline-block hover:underline">
              ← Our Chef Network
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li
                key={e.chefId}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a5f3f] text-white flex items-center justify-center font-bold text-lg">
                  {e.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {e.name ?? 'Chef'}
                    </span>
                    {e.topPerformer && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FFBC00] text-forestDark">
                        Top Performer
                      </span>
                    )}
                  </div>
                  {e.badgeNames.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.badgeNames.join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-amber-500" aria-label={`${e.starRating} stars`}>
                  {'★'.repeat(e.starRating)}{'☆'.repeat(5 - e.starRating)}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center">
          <Link href="/chefs" className="text-forestDark font-medium hover:underline">
            ← Our Chef Network
          </Link>
          {' · '}
          <Link href="/book" className="text-forestDark font-medium hover:underline">
            Book a chef
          </Link>
        </p>
      </main>
    </div>
  )
}

