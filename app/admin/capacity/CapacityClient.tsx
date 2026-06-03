'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getPlan, saveConfig } from './actions'
import type { CapacityPlan, CapacityConfigRow } from '@/lib/capacity-planning'

type Props = {
  initialPlan: CapacityPlan
  initialConfig: CapacityConfigRow | null
}

export default function CapacityClient({ initialPlan, initialConfig }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<CapacityPlan>(initialPlan)
  const [config, setConfig] = useState<CapacityConfigRow | null>(initialConfig)
  const [horizon, setHorizon] = useState<3 | 6 | 12>(initialPlan.horizon)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    setPlan(initialPlan)
    setConfig(initialConfig)
    setHorizon(initialPlan.horizon)
  }, [initialPlan, initialConfig])

  const changeHorizon = (h: 3 | 6 | 12) => {
    setHorizon(h)
    const next = new URLSearchParams(searchParams.toString())
    next.set('horizon', String(h))
    router.push(`/admin/capacity?${next.toString()}`)
  }

  const refreshPlan = async () => {
    const next = await getPlan(horizon)
    setPlan(next)
    router.refresh()
  }

  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const growth = parseFloat((form.querySelector('[name="growthRatePctPerMonth"]') as HTMLInputElement)?.value || '0')
    const avgJobs = (form.querySelector('[name="avgJobsPerChefPerDay"]') as HTMLInputElement)?.value?.trim()
    const attrition = parseFloat((form.querySelector('[name="attritionRatePctPerMonth"]') as HTMLInputElement)?.value || '0')
    const res = await saveConfig({
      growthRatePctPerMonth: growth,
      avgJobsPerChefPerDay: avgJobs === '' ? null : parseFloat(avgJobs),
      attritionRatePctPerMonth: attrition,
    })
    if (res.success) {
      toast.success('Config saved')
      setShowConfig(false)
      router.refresh()
      refreshPlan()
    } else toast.error(res.error)
  }

  const riskClass = (risk: string) =>
    risk === 'shortfall' ? 'bg-red-100 text-red-800' : risk === 'surplus' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Horizon:</span>
        {([3, 6, 12] as const).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => changeHorizon(h)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              horizon === h ? 'bg-forestDark text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {h} months
          </button>
        ))}
        <button type="button" onClick={() => router.refresh()} className="rounded px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-sm">
          Refresh
        </button>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-sm text-forestDark hover:underline"
        >
          {showConfig ? 'Hide' : 'Edit'} inputs
        </button>
      </div>

      {showConfig && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Planning inputs</h2>
          <form onSubmit={handleSaveConfig} className="space-y-3 max-w-md">
            <label className="block text-sm">
              Growth rate (% per month)
              <input
                name="growthRatePctPerMonth"
                type="number"
                step="0.1"
                defaultValue={config?.growthRatePctPerMonth ?? plan.inputs.growthRatePctPerMonth}
                className="ml-2 border rounded px-2 py-1 w-24"
              />
            </label>
            <label className="block text-sm">
              Avg jobs per chef per day (blank = from data)
              <input
                name="avgJobsPerChefPerDay"
                type="number"
                step="0.01"
                defaultValue={config?.avgJobsPerChefPerDay ?? ''}
                placeholder="auto"
                className="ml-2 border rounded px-2 py-1 w-24"
              />
            </label>
            <label className="block text-sm">
              Attrition rate (% per month)
              <input
                name="attritionRatePctPerMonth"
                type="number"
                step="0.1"
                defaultValue={config?.attritionRatePctPerMonth ?? plan.inputs.attritionRatePctPerMonth}
                className="ml-2 border rounded px-2 py-1 w-24"
              />
            </label>
            <button type="submit" className="rounded px-3 py-1.5 bg-green-600 text-white text-sm">Save</button>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Inputs (current)</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Historical bookings/day: <strong>{plan.inputs.historicalBookingsPerDay}</strong></li>
          <li>Growth rate: <strong>{plan.inputs.growthRatePctPerMonth}%</strong> per month</li>
          <li>Avg jobs per chef/day: <strong>{plan.inputs.avgJobsPerChefPerDay}</strong></li>
          <li>Attrition: <strong>{plan.inputs.attritionRatePctPerMonth}%</strong> per month</li>
          <li>Current active chefs: <strong>{plan.inputs.currentActiveChefs}</strong></li>
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Risk</h2>
        <p className={`text-sm px-2 py-1 rounded inline-block ${plan.riskFlags.shortfall ? 'bg-red-100 text-red-800' : plan.riskFlags.surplus ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
          {plan.riskFlags.summary}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900">Required chefs by month</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projected bookings/day</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required chefs</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current capacity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gap</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hire target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plan.months.map((m) => (
                <tr key={m.monthLabel} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{m.monthLabel}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{m.projectedBookingsPerDay}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{m.requiredChefs}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{m.currentCapacity}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{m.gap}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{m.hireTarget}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${riskClass(m.risk)}`}>{m.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Actions</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><Link href="/admin/chefs" className="text-forestDark hover:underline">Trigger chef recruitment</Link></li>
          <li><Link href="/admin/okrs" className="text-forestDark hover:underline">Adjust incentives / OKRs</Link></li>
          <li><Link href="/admin/region-pricing" className="text-forestDark hover:underline">Shift regional focus (pricing)</Link></li>
        </ul>
      </div>
    </div>
  )
}

