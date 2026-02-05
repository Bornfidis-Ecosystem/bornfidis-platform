'use client'

import Link from 'next/link'
import type { CostInsightsData } from '@/lib/cost-insights'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export default function CostInsightsClient({ data }: { data: CostInsightsData }) {
  const { labor, idleCapacity, surge, rework, travel, recommendations, generatedAt } = data

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        Last 30 days · Generated {new Date(generatedAt).toLocaleString()}
      </p>

      {recommendations.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900 mb-2">Recommendations</h2>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/admin/region-pricing" className="text-xs text-[#1a5f3f] hover:underline">Region pricing →</Link>
            <Link href="/admin/surge-pricing" className="text-xs text-[#1a5f3f] hover:underline">Surge thresholds →</Link>
            <Link href="/admin/schedule" className="text-xs text-[#1a5f3f] hover:underline">Schedule / availability →</Link>
            <Link href="/admin/coaching" className="text-xs text-[#1a5f3f] hover:underline">Coaching →</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Labor efficiency</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Avg revenue/booking:</span> <strong>{formatUSD(labor.avgRevenuePerBookingCents)}</strong></li>
            <li><span className="text-gray-600">Avg payout/booking:</span> <strong>{formatUSD(labor.avgPayoutPerBookingCents)}</strong></li>
            <li><span className="text-gray-600">Payout vs revenue:</span> <strong>{labor.payoutToRevenuePct}%</strong></li>
            <li><span className="text-gray-600">Bookings (paid):</span> <strong>{labor.bookingCount}</strong></li>
          </ul>
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Surge usage</h2>
          <p className="text-sm text-gray-700 mb-2">{surge.message}</p>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Bookings with surge:</span> <strong>{surge.bookingsWithSurge}</strong> ({surge.pctOfBookingsWithSurge}%)</li>
            <li><span className="text-gray-600">Total surge cost:</span> <strong>{formatUSD(surge.totalSurgeCents)}</strong></li>
            <li><span className="text-gray-600">Top 10% drive:</span> <strong>{surge.topBookingsDrivePctSurge}%</strong> of surge costs</li>
          </ul>
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Rework (cancellations)</h2>
          <p className="text-sm text-gray-700 mb-2">{rework.message}</p>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Cancellations:</span> <strong>{rework.cancellationsCount}</strong></li>
            <li><span className="text-gray-600">Est. revenue impact:</span> <strong>{formatUSD(rework.cancelledRevenueCents)}</strong></li>
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Idle capacity (by day of week)</h2>
        <p className="text-xs text-gray-500 mb-2">Available chef-slots vs assigned bookings. High idle % = rebalance availability.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Day</th>
                <th className="text-right py-2 font-medium text-gray-500">Available</th>
                <th className="text-right py-2 font-medium text-gray-500">Assigned</th>
                <th className="text-right py-2 font-medium text-gray-500">Idle %</th>
              </tr>
            </thead>
            <tbody>
              {idleCapacity.map((d) => (
                <tr key={d.dayOfWeek} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{d.dayName}</td>
                  <td className="text-right">{d.availableSlots}</td>
                  <td className="text-right">{d.assignedSlots}</td>
                  <td className="text-right">{d.idlePct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Travel costs (region)</h2>
        <p className="text-sm text-gray-700 mb-2">{travel.message}</p>
        {travel.byRegion.length > 0 && (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Region</th>
                <th className="text-right py-2 font-medium text-gray-500">Travel fees</th>
                <th className="text-right py-2 font-medium text-gray-500">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {travel.byRegion.map((r) => (
                <tr key={r.regionCode} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{r.regionCode}</td>
                  <td className="text-right">{formatUSD(r.travelCents)}</td>
                  <td className="text-right">{r.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-2">
          <Link href="/admin/region-pricing" className="text-xs text-[#1a5f3f] hover:underline">Adjust region pricing →</Link>
        </div>
      </section>
    </div>
  )
}
