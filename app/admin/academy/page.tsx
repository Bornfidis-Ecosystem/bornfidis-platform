import Link from 'next/link'
import { getAcademyStatsWithPeriod } from '@/lib/academy-stats'
import { formatCurrency } from '@/lib/formatCurrency'
import SignOutButton from '@/components/admin/SignOutButton'

export const dynamic = 'force-dynamic'

/**
 * Admin Academy analytics dashboard.
 * Protected by admin layout. Server-side fetch.
 */
export default async function AdminAcademyPage() {
  let stats
  try {
    stats = await getAcademyStatsWithPeriod()
  } catch (e) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading Academy stats</p>
            <p className="text-sm mt-1">{e instanceof Error ? e.message : 'Server error'}</p>
          </div>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(
    1,
    ...stats.revenueByProduct.map((r) => r.revenue)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Academy Analytics</h1>
              <p className="text-gold text-sm mt-1">Revenue, sales, and product performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/academy"
                className="px-4 py-2 border border-gold text-gold rounded hover:bg-gold hover:text-navy transition text-sm font-semibold"
              >
                View Academy
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 5 metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-navy mt-1">{formatCurrency(stats.totalRevenue)}</p>
            {stats.last30DaysRevenue !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                Last 30 days: {formatCurrency(stats.last30DaysRevenue)}
              </p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Sales</p>
            <p className="text-2xl font-bold text-navy mt-1">{stats.totalPaidSales}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Free Claims</p>
            <p className="text-2xl font-bold text-navy mt-1">{stats.totalFreeClaims}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Free → Paid Conversion</p>
            <p className="text-2xl font-bold text-navy mt-1">
              {Math.round(stats.freeToPaidConversionRate * 100)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</p>
            <p className="text-2xl font-bold text-navy mt-1">{formatCurrency(stats.averageOrderValue)}</p>
          </div>
        </div>

        {/* Momentum (lifetime vs 30 days) */}
        {stats.lifetimeRevenue !== undefined && stats.last30DaysRevenue !== undefined && (
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-navy mb-3">Momentum</h2>
            <div className="flex flex-wrap gap-6">
              <div>
                <span className="text-sm text-gray-500">Lifetime revenue</span>
                <p className="text-xl font-bold text-navy">{formatCurrency(stats.lifetimeRevenue)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Last 30 days</span>
                <p className="text-xl font-bold text-navy">{formatCurrency(stats.last30DaysRevenue)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Revenue by product table + bar */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-navy">Revenue by Product</h2>
          </div>
          <div className="overflow-x-auto">
            {stats.revenueByProduct.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No purchases yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 w-48 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.revenueByProduct.map((row) => (
                    <tr key={row.slug} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <span className="font-medium text-navy">{row.title}</span>
                        <span className="block text-xs text-gray-500">{row.slug}</span>
                      </td>
                      <td className="px-6 py-3 text-right">{row.sales}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatCurrency(row.revenue)}</td>
                      <td className="px-6 py-3">
                        <div className="h-6 bg-gray-100 rounded overflow-hidden min-w-[80px] max-w-full">
                          <div
                            className="h-full bg-gold rounded"
                            style={{
                              width: `${(row.revenue / maxRevenue) * 100}%`,
                              minWidth: row.revenue > 0 ? '4px' : '0',
                            }}
                            title={`${maxRevenue ? ((row.revenue / maxRevenue) * 100).toFixed(0) : 0}% of max`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

