import Link from 'next/link'
import { getAdminReviewAnalytics } from '@/lib/review-analytics'
import SignOutButton from '@/components/admin/SignOutButton'

export const dynamic = 'force-dynamic'

/**
 * Phase 2W — Review analytics (Admin/Staff).
 * Cards: Avg ⭐, Reviews, Low-rating %. Table: Chef | Avg ⭐ | Reviews | Flagged. Click chef → detail.
 */
export default async function AdminReviewAnalyticsPage() {
  const analytics = await getAdminReviewAnalytics()
  const { summary, chefs } = analytics

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-gold hover:underline text-sm mb-2 inline-block">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold">Review Analytics</h1>
              <p className="text-green-100 text-sm mt-1">Quality trends and low-rating flags</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Phase 2X: Featured chefs — remove ineligible (weekly review) */}
        <RemoveIneligibleFeaturedButton />

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg rating</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {summary.totalReviews > 0 ? summary.avgRating.toFixed(1) : '—'} ★
            </p>
            <p className="text-sm text-gray-500 mt-1">All reviews</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total reviews</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalReviews}</p>
            <p className="text-sm text-gray-500 mt-1">Verified client reviews</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low-rating %</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.lowRatingPercent}%</p>
            <p className="text-sm text-gray-500 mt-1">≤3★ ({summary.flaggedCount} flagged)</p>
          </div>
        </div>

        {/* Per-chef table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
            By chef — click name for detail
          </h2>
          {chefs.length === 0 ? (
            <p className="px-4 py-8 text-sm text-gray-500 text-center">No reviews yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Chef</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Avg ★</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Reviews</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Flagged (≤3★)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chefs.map((row) => (
                  <tr key={row.chefId} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/chefs/${row.chefId}`}
                        className="font-medium text-forestDark hover:underline"
                      >
                        {row.chefName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">{row.averageRating.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{row.count}</td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={
                          row.flaggedCount > 0
                            ? 'font-medium text-amber-600'
                            : 'text-gray-500'
                        }
                      >
                        {row.flaggedCount} ({row.lowRatingPercent}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

