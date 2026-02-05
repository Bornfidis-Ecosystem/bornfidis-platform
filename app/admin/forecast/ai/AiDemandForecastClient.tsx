'use client'

import Link from 'next/link'
import type { AiDemandForecast, HorizonBand } from '@/lib/ai-demand-forecast'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

function Band({ band }: { band: HorizonBand }) {
  return (
    <span className="text-amber-700 font-medium">
      {band.low}–{band.high} <span className="text-gray-500 font-normal">(base {band.base})</span>
    </span>
  )
}

export default function AiDemandForecastClient({ data }: { data: AiDemandForecast }) {
  const gen = new Date(data.generatedAt).toLocaleString()

  return (
    <div className="space-y-6">
      {/* Confidence ranges summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">30 / 90 / 180 day horizons</h2>
        <p className="text-sm text-gray-600">
          Confidence bands: low = 85% of base, high = 115% of base. Forecasts align with historical + recent trend.
        </p>
      </div>

      {/* By region */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          Bookings volume by region
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Region</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">30d (low–high)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">90d (low–high)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">180d (low–high)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.byRegion.map((r) => (
                <tr key={r.regionCode}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.regionName}</td>
                  <td className="px-4 py-3 text-right"><Band band={r.period30} /></td>
                  <td className="px-4 py-3 text-right"><Band band={r.period90} /></td>
                  <td className="px-4 py-3 text-right"><Band band={r.period180} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak days */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Peak days (next 30d)</h2>
        <p className="text-xs text-gray-500 mb-2">Top 5 days by projected bookings (day-of-week pattern).</p>
        <ul className="space-y-1 text-sm">
          {data.peakDays.map((p) => (
            <li key={p.date}>
              <span className="font-medium text-gray-900">{p.date}</span>
              <span className="text-gray-500 ml-2">{p.dayOfWeek}</span>
              <span className="text-amber-700 ml-2">{p.projectedBookings} bookings</span>
              {p.reason && <span className="text-gray-500 ml-2">— {p.reason}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Capacity shortfalls */}
      {data.capacityShortfalls.length > 0 && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <h2 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">Capacity shortfalls</h2>
          <ul className="space-y-1 text-sm text-amber-800">
            {data.capacityShortfalls.map((s) => (
              <li key={s.monthLabel}>
                {s.monthLabel}: gap {s.gap} chefs, required {s.requiredChefs}, hire target {s.hireTarget}
              </li>
            ))}
          </ul>
          <Link href="/admin/capacity" className="text-sm text-[#1a5f3f] hover:underline mt-2 inline-block">Capacity planning →</Link>
        </div>
      )}

      {/* Revenue impact */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          Revenue impact (confidence range)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Period</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Low</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Base</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">High</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">30 days</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period30.low)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period30.base)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period30.high)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">90 days</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period90.low)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period90.base)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period90.high)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">180 days</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period180.low)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period180.base)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatUSD(data.revenueImpact.period180.high)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action suggestions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Suggested actions</h2>
        <ul className="space-y-2 text-sm">
          {data.actionSuggestions.map((a, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <Link href={a.href} className="text-[#1a5f3f] font-medium hover:underline">
                {a.action}
              </Link>
              <span className="text-gray-600">— {a.reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Inputs & assumptions</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Avg bookings/day (last 30d): <strong>{data.inputs.avgBookingsPerDay30}</strong></li>
          <li>Trend (last 14d vs prior 14d): <strong>{data.inputs.trendPct >= 0 ? '+' : ''}{(data.inputs.trendPct * 100).toFixed(1)}%</strong></li>
          <li>Avg order value: <strong>{formatUSD(data.inputs.avgOrderValueCents)}</strong></li>
          <li>{data.inputs.note}</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">Generated {gen}. Lightweight model; no heavy ML. Nightly recalculation recommended for caching.</p>
      </div>
    </div>
  )
}
