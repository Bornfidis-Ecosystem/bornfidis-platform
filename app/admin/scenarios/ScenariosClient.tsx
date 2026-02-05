'use client'

import { useState, useMemo } from 'react'
import type { ScenarioInputs, ScenarioResult, ScenarioOutput } from '@/lib/scenarios'
import { buildScenarios } from '@/lib/scenarios'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

function OutputCard({
  title,
  period30,
  period90,
  variant,
}: {
  title: string
  period30: ScenarioOutput
  period90: ScenarioOutput
  variant: 'best' | 'base' | 'worst'
}) {
  const bg = variant === 'best' ? 'bg-green-50 border-green-200' : variant === 'worst' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 uppercase tracking-wide mb-1">30 days</p>
          <p><span className="text-gray-600">Revenue:</span> {formatUSD(period30.revenueCentsLow)} – {formatUSD(period30.revenueCentsHigh)}</p>
          <p><span className="text-gray-600">Jobs:</span> {period30.jobsCompleted}</p>
          <p><span className="text-gray-600">Cash in:</span> {formatUSD(period30.cashInCents)}</p>
          <p><span className="text-gray-600">Cash out (est.):</span> {formatUSD(period30.cashOutCents)}</p>
          <p><span className="text-gray-600">Req. capacity (chef-days):</span> {period30.requiredChefDays}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase tracking-wide mb-1">90 days</p>
          <p><span className="text-gray-600">Revenue:</span> {formatUSD(period90.revenueCentsLow)} – {formatUSD(period90.revenueCentsHigh)}</p>
          <p><span className="text-gray-600">Jobs:</span> {period90.jobsCompleted}</p>
          <p><span className="text-gray-600">Cash in:</span> {formatUSD(period90.cashInCents)}</p>
          <p><span className="text-gray-600">Cash out (est.):</span> {formatUSD(period90.cashOutCents)}</p>
          <p><span className="text-gray-600">Req. capacity (chef-days):</span> {period90.requiredChefDays}</p>
        </div>
      </div>
    </div>
  )
}

export default function ScenariosClient({ initialInputs }: { initialInputs: ScenarioInputs }) {
  const [inputs] = useState(initialInputs)
  const [demandFactor, setDemandFactor] = useState(1.0)
  const [capacityFactor, setCapacityFactor] = useState(1.0)
  const [pricingFactor, setPricingFactor] = useState(1.0)

  const overrides = useMemo(
    () => ({
      demandFactor,
      capacityFactor,
      pricingFactor,
    }),
    [demandFactor, capacityFactor, pricingFactor]
  )

  const scenarios = useMemo(
    () => buildScenarios(inputs, overrides),
    [inputs, overrides]
  )

  const exportCSV = () => {
    const rows: string[] = [
      'Scenario,Period,Revenue Low,Revenue Expected,Revenue High,Jobs Completed,Required Chef-Days,Cash In,Cash Out',
      ...(['best', 'base', 'worst'] as const).flatMap((key) => {
        const r = scenarios[key]
        return [
          `${key},30d,${r.period30.revenueCentsLow},${r.period30.revenueCentsExpected},${r.period30.revenueCentsHigh},${r.period30.jobsCompleted},${r.period30.requiredChefDays},${r.period30.cashInCents},${r.period30.cashOutCents}`,
          `${key},90d,${r.period90.revenueCentsLow},${r.period90.revenueCentsExpected},${r.period90.revenueCentsHigh},${r.period90.jobsCompleted},${r.period90.requiredChefDays},${r.period90.cashInCents},${r.period90.cashOutCents}`,
        ]
      }),
    ]
    const header = 'Assumptions\n' +
      `avg_bookings_per_day,${inputs.avgBookingsPerDay}\n` +
      `avg_order_value_cents,${inputs.avgOrderValueCents}\n` +
      `cancellation_rate,${inputs.cancellationRate}\n` +
      `demand_factor,${demandFactor}\n` +
      `capacity_factor,${capacityFactor}\n` +
      `pricing_factor,${pricingFactor}\n` +
      `generated_at,${inputs.generatedAt}\n\n`
    const csv = header + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scenarios-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Base scenario controls</h2>
        <p className="text-xs text-gray-500 mb-3">Adjust base case; Best and Worst are fixed multipliers. Recalc is instant.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <label className="block">
            <span className="text-gray-700">Demand factor</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={demandFactor}
              onChange={(e) => setDemandFactor(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
            <span className="text-gray-600">{demandFactor.toFixed(2)}</span>
          </label>
          <label className="block">
            <span className="text-gray-700">Capacity factor</span>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={capacityFactor}
              onChange={(e) => setCapacityFactor(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
            <span className="text-gray-600">{capacityFactor.toFixed(2)}</span>
          </label>
          <label className="block">
            <span className="text-gray-700">Pricing factor</span>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={pricingFactor}
              onChange={(e) => setPricingFactor(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
            <span className="text-gray-600">{pricingFactor.toFixed(2)}</span>
          </label>
        </div>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OutputCard title="Best (high demand + full capacity)" period30={scenarios.best.period30} period90={scenarios.best.period90} variant="best" />
        <OutputCard title="Base (current trends)" period30={scenarios.base.period30} period90={scenarios.base.period90} variant="base" />
        <OutputCard title="Worst (demand dip or capacity loss)" period30={scenarios.worst.period30} period90={scenarios.worst.period90} variant="worst" />
      </div>

      {/* Assumptions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Assumptions</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Avg bookings/day: <strong>{inputs.avgBookingsPerDay}</strong></li>
          <li>Avg order value: <strong>{formatUSD(inputs.avgOrderValueCents)}</strong></li>
          <li>Available chef-days today: <strong>{inputs.availableChefDaysPerDay}</strong></li>
          <li>Total chef-days today: <strong>{inputs.totalChefDaysPerDay}</strong></li>
          <li>Cancellation rate: <strong>{(inputs.cancellationRate * 100).toFixed(1)}%</strong></li>
          <li>Base sliders: demand {demandFactor.toFixed(2)}, capacity {capacityFactor.toFixed(2)}, pricing {pricingFactor.toFixed(2)}</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Generated {new Date(inputs.generatedAt).toLocaleString()}. Outputs align with forecast logic. Not guarantees.
        </p>
      </div>

      {/* Export */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={exportCSV}
          className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
        >
          Export summary (CSV)
        </button>
      </div>
    </div>
  )
}
