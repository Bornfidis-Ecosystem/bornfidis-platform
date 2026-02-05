'use client'

import type { ForecastData } from '@/lib/forecast'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export default function ForecastClient({ data }: { data: ForecastData }) {
  const a = data.assumptions
  const gen = new Date(data.generatedAt).toLocaleString()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Next 30 days</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Confirmed:</span>{' '}
              <strong className="text-gray-900">{formatUSD(data.period30.confirmedCents)}</strong>
              <span className="text-gray-500 ml-1">({data.period30.confirmedCount} bookings)</span>
            </p>
            <p className="text-amber-700 font-medium">
              Projected (estimate): {formatUSD(data.period30.projectedLowCents)} – {formatUSD(data.period30.projectedHighCents)}
              <span className="text-gray-500 font-normal ml-1">(expected {formatUSD(data.period30.projectedExpectedCents)})</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Next 90 days</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Confirmed:</span>{' '}
              <strong className="text-gray-900">{formatUSD(data.period90.confirmedCents)}</strong>
              <span className="text-gray-500 ml-1">({data.period90.confirmedCount} bookings)</span>
            </p>
            <p className="text-amber-700 font-medium">
              Projected (estimate): {formatUSD(data.period90.projectedLowCents)} – {formatUSD(data.period90.projectedHighCents)}
              <span className="text-gray-500 font-normal ml-1">(expected {formatUSD(data.period90.projectedExpectedCents)})</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          Confirmed vs projected
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Period</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Confirmed (locked)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Projected low</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Projected expected</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Projected high</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">30 days</td>
                <td className="px-4 py-3 text-right text-gray-900">{formatUSD(data.period30.confirmedCents)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.period30.projectedLowCents)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.period30.projectedExpectedCents)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.period30.projectedHighCents)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">90 days</td>
                <td className="px-4 py-3 text-right text-gray-900">{formatUSD(data.period90.confirmedCents)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.period90.projectedLowCents)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.period90.projectedExpectedCents)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.period90.projectedHighCents)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Assumptions</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Avg bookings/day (last 30d): <strong>{a.avgBookingsPerDay30}</strong></li>
          <li>Avg bookings/day (last 90d): <strong>{a.avgBookingsPerDay90}</strong></li>
          <li>Avg order value: <strong>{formatUSD(a.avgOrderValueCents)}</strong></li>
          <li>Capacity factor (available vs total slots today): <strong>{a.capacityFactor}</strong></li>
          <li>{a.seasonalityNote}</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Generated {gen}. Projections are estimates only and do not guarantee future revenue. Recalculated on each load; nightly cron can be added for caching.
        </p>
      </div>
    </div>
  )
}
