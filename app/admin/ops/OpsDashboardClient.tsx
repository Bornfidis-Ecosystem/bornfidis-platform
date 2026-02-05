'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import type { DateRangeKey, OpsDashboardData } from '@/lib/ops-dashboard'
import type { ForecastData } from '@/lib/forecast'
import type { OkrSnapshotItem } from '@/lib/okrs'
import type { AiOpsInsightRow } from '@/lib/ai-ops-insights'
import { AI_OPS_CATEGORIES } from '@/lib/ai-ops-insights'
import type { SuccessionSnapshot } from '@/lib/succession'
import { generateInsights, setAiCategoryEnabled, snoozeAiInsight, markAiInsightActionTaken } from './actions'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 min
const CATEGORY_LABELS: Record<string, string> = {
  at_risk_booking: 'At-risk booking',
  quality_risk: 'Quality risk',
  cost_leak: 'Cost leak',
  capacity_gap: 'Capacity gap',
}

type ScenarioSnapshot = { base30dRevenueCents: number; base90dRevenueCents: number }
type CostSnapshot = { payoutToRevenuePct: number; topRecommendation: string | null }
type CapacitySnapshot = {
  horizon: 3
  nextMonth: { requiredChefs: number; gap: number; hireTarget: number; risk: string }
  riskSummary: string
}
type AiDemandSnapshot = {
  period30Bookings: { low: number; base: number; high: number }
  hasShortfall: boolean
  actionCount: number
  generatedAt: string
}
type RiskSnapshot = {
  total: number
  open: number
  monitoring: number
  closed: number
  byCategory: { category: string; count: number }[]
  needsReview: number
  generatedAt: string
}
type GrowthExperimentsSnapshot = {
  runningCount: number
  completedWithWinner: number
  total: number
  generatedAt: string
}
type Props = {
  initialData: OpsDashboardData
  forecastSnapshot?: ForecastData | null
  scenarioSnapshot?: ScenarioSnapshot | null
  costSnapshot?: CostSnapshot | null
  okrSnapshot?: OkrSnapshotItem[]
  capacitySnapshot?: CapacitySnapshot | null
  aiInsights?: AiOpsInsightRow[]
  aiCategoryToggles?: Record<string, boolean>
  successionSnapshot?: SuccessionSnapshot | null
  aiDemandSnapshot?: AiDemandSnapshot | null
  riskSnapshot?: RiskSnapshot | null
  growthExperimentsSnapshot?: GrowthExperimentsSnapshot | null
}

export default function OpsDashboardClient({
  initialData,
  forecastSnapshot,
  scenarioSnapshot,
  costSnapshot,
  okrSnapshot,
  capacitySnapshot,
  aiInsights = [],
  aiCategoryToggles = {},
  successionSnapshot,
  aiDemandSnapshot,
  riskSnapshot,
  growthExperimentsSnapshot,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<OpsDashboardData>(initialData)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [insights, setInsights] = useState<AiOpsInsightRow[]>(aiInsights)
  const [toggles, setToggles] = useState<Record<string, boolean>>(aiCategoryToggles)
  const [actionTakenFor, setActionTakenFor] = useState<Record<string, string>>({})

  useEffect(() => {
    setData(initialData)
  }, [initialData])
  useEffect(() => {
    setInsights(aiInsights)
    setToggles(aiCategoryToggles)
  }, [aiInsights, aiCategoryToggles])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [autoRefresh, router])

  const setRange = (range: DateRangeKey) => {
    const next = new URLSearchParams(searchParams.toString())
    next.set('range', range)
    router.push(`/admin/ops?${next.toString()}`)
  }

  const k = data.kpis

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Date range:</span>
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                data.range === r
                  ? 'bg-[#1a5f3f] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (5 min)
        </label>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Operations</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Bookings today:</span> <strong>{k.bookingsToday}</strong></li>
            <li><span className="text-gray-600">Bookings (7d):</span> <strong>{k.bookingsWeek}</strong></li>
            <li><span className="text-gray-600">Completion rate:</span> <strong>{k.completionRatePct}%</strong></li>
            <li><span className="text-gray-600">Avg assignment time:</span> <strong>{k.avgAssignmentTimeHours}h</strong></li>
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quality</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Avg rating:</span> <strong>{k.avgRating || '—'}</strong></li>
            <li><span className="text-gray-600">Low ratings (≤3★):</span> <strong>{k.lowRatingCount}</strong></li>
            <li><span className="text-gray-600">Active coaching:</span> <strong>{k.activeCoachingCases}</strong></li>
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">People</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Active chefs:</span> <strong>{k.activeChefs}</strong></li>
            <li><span className="text-gray-600">Available today:</span> <strong>{k.availableToday}</strong></li>
            <li><span className="text-gray-600">Featured chefs:</span> <strong>{k.featuredChefs}</strong></li>
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Finance</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Payouts pending:</span> <strong>{k.payoutsPending}</strong></li>
            <li><span className="text-gray-600">Payouts paid (MTD):</span> <strong>{k.payoutsPaidMtd}</strong></li>
            <li><span className="text-gray-600">Bonus % applied:</span> <strong>{k.bonusPctApplied}%</strong></li>
          </ul>
        </div>
        {forecastSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Revenue forecast</h2>
            <ul className="space-y-1 text-sm">
              <li><span className="text-gray-600">30d confirmed:</span> <strong>{formatForecastUSD(forecastSnapshot.period30.confirmedCents)}</strong></li>
              <li><span className="text-gray-600">90d confirmed:</span> <strong>{formatForecastUSD(forecastSnapshot.period90.confirmedCents)}</strong></li>
              <li><span className="text-gray-600">30d projected (est.):</span> <strong className="text-amber-700">{formatForecastUSD(forecastSnapshot.period30.projectedExpectedCents)}</strong></li>
            </ul>
            <Link href="/admin/forecast" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">View forecast →</Link>
          </div>
        )}
        {scenarioSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Scenario (base)</h2>
            <ul className="space-y-1 text-sm">
              <li><span className="text-gray-600">30d revenue:</span> <strong>{formatForecastUSD(scenarioSnapshot.base30dRevenueCents)}</strong></li>
              <li><span className="text-gray-600">90d revenue:</span> <strong>{formatForecastUSD(scenarioSnapshot.base90dRevenueCents)}</strong></li>
            </ul>
            <Link href="/admin/scenarios" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">Scenario planning →</Link>
          </div>
        )}
        {costSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cost (30d)</h2>
            <ul className="space-y-1 text-sm">
              <li><span className="text-gray-600">Payout vs revenue:</span> <strong>{costSnapshot.payoutToRevenuePct}%</strong></li>
              {costSnapshot.topRecommendation && (
                <li className="text-amber-700 text-xs truncate" title={costSnapshot.topRecommendation}>{costSnapshot.topRecommendation}</li>
              )}
            </ul>
            <Link href="/admin/costs" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">Cost insights →</Link>
          </div>
        )}
        {okrSnapshot && okrSnapshot.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">OKRs ({okrSnapshot[0]?.period ?? '—'})</h2>
            <ul className="space-y-2 text-sm">
              {okrSnapshot.slice(0, 2).map((okr) => (
                <li key={okr.okrId}>
                  <span className="text-gray-700 font-medium">{okr.objective}</span>
                  <ul className="mt-1 ml-2 space-y-0.5 text-xs text-gray-600">
                    {okr.keyResults.slice(0, 3).map((kr) => (
                      <li key={kr.id}>
                        {kr.metric.replace(/_/g, ' ')}: {kr.progressPct}% — {kr.status.replace('_', ' ')}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <Link href="/admin/okrs" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">View OKRs →</Link>
          </div>
        )}
        {capacitySnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Capacity (3mo)</h2>
            <p className="text-sm text-gray-600">Next month: {capacitySnapshot.nextMonth.requiredChefs} chefs required, gap {capacitySnapshot.nextMonth.gap}, hire target {capacitySnapshot.nextMonth.hireTarget}</p>
            <p className={`text-xs mt-1 ${capacitySnapshot.nextMonth.risk === 'shortfall' ? 'text-red-600' : capacitySnapshot.nextMonth.risk === 'surplus' ? 'text-amber-600' : 'text-green-600'}`}>
              {capacitySnapshot.riskSummary}
            </p>
            <Link href="/admin/capacity" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">Capacity planning →</Link>
          </div>
        )}
        {successionSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Succession (Phase 2BA)</h2>
            <p className="text-sm text-gray-600">
              Roles with backup: {successionSnapshot.rolesWithBackup}/{successionSnapshot.totalRoles}
            </p>
            {successionSnapshot.gaps.length > 0 && (
              <p className="text-xs text-amber-700 mt-1">Gaps: {successionSnapshot.gaps.join(', ')}</p>
            )}
            <Link href="/admin/succession" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">Succession planning →</Link>
          </div>
        )}
        {aiDemandSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Demand (Phase 2BB)</h2>
            <p className="text-sm text-gray-600">
              30d bookings: {aiDemandSnapshot.period30Bookings.low}–{aiDemandSnapshot.period30Bookings.high} <span className="text-gray-500">(base {aiDemandSnapshot.period30Bookings.base})</span>
            </p>
            {aiDemandSnapshot.hasShortfall && (
              <p className="text-xs text-amber-700 mt-1">Capacity shortfall — consider recruitment.</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{aiDemandSnapshot.actionCount} suggested action(s)</p>
            <Link href="/admin/forecast/ai" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">AI demand forecast →</Link>
          </div>
        )}
        {riskSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Risks (Phase 2BC)</h2>
            <p className="text-sm text-gray-600">
              Open: <strong>{riskSnapshot.open}</strong> · Monitoring: <strong>{riskSnapshot.monitoring}</strong> · Closed: <strong>{riskSnapshot.closed}</strong>
            </p>
            {riskSnapshot.needsReview > 0 && (
              <p className="text-xs text-amber-700 mt-1">{riskSnapshot.needsReview} need review (monthly cadence)</p>
            )}
            <Link href="/admin/risks" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">Risk register →</Link>
          </div>
        )}
        {growthExperimentsSnapshot && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Growth experiments (Phase 2BD)</h2>
            <p className="text-sm text-gray-600">
              Running: <strong>{growthExperimentsSnapshot.runningCount}</strong> · Completed with winner: <strong>{growthExperimentsSnapshot.completedWithWinner}</strong>
            </p>
            <Link href="/admin/experiments" className="text-xs text-[#1a5f3f] hover:underline mt-2 inline-block">Experiments →</Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">At Risk</h2>
            <p className="text-xs text-gray-500">Low ratings, late, missed prep — click through to detail.</p>
          </div>
          <div className="overflow-x-auto">
            {data.atRisk.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No at-risk items in this period.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.atRisk.map((row) => (
                    <tr key={`${row.bookingId}-${row.reason}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        <Link href={`/admin/bookings/${row.bookingId}`} className="text-[#1a5f3f] hover:underline">
                          {row.bookingName}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Link href={`/admin/chefs/${row.chefId}`} className="text-[#1a5f3f] hover:underline">
                          {row.chefName ?? row.chefId}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                          {row.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Ops</h2>
            <p className="text-xs text-gray-500">Bookings and assignments for today.</p>
          </div>
          <div className="overflow-x-auto">
            {data.todaysOps.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No bookings today.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.todaysOps.map((row) => (
                    <tr key={row.bookingId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        <Link href={`/admin/bookings/${row.bookingId}`} className="text-[#1a5f3f] hover:underline">
                          {row.bookingName}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{row.eventTime ?? '—'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {row.chefId ? (
                          <Link href={`/admin/chefs/${row.chefId}`} className="text-[#1a5f3f] hover:underline">
                            {row.chefName ?? row.chefId}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">SLA At Risk (Phase 2AJ)</h2>
          <p className="text-xs text-gray-500">Bookings with breached or at-risk SLAs — assignment, confirmation, prep, arrival.</p>
        </div>
        <div className="overflow-x-auto">
          {data.slaAtRisk.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No SLA at risk.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SLA status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Breaches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slaAtRisk.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      <Link href={`/admin/bookings/${row.id}`} className="text-[#1a5f3f] hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {row.eventDate}{row.eventTime ? ` ${row.eventTime}` : ''}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                        row.slaStatus === 'breached' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.slaStatus === 'breached' ? 'Breached' : 'At risk'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {row.breachTypes.length ? row.breachTypes.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Insights (Phase 2AZ)</h2>
            <p className="text-xs text-gray-500">Actionable insights from ops data; snooze or log action taken.</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const res = await generateInsights()
              if (res.error) toast.error(res.error)
              else {
                toast.success(`Generated ${res.created} new insight(s)`)
                router.refresh()
              }
            }}
            className="rounded px-3 py-1.5 bg-[#1a5f3f] text-white text-sm hover:bg-[#144a30]"
          >
            Generate insights
          </button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-2">Categories</p>
          <div className="flex flex-wrap gap-3">
            {AI_OPS_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={toggles[cat] ?? true}
                  onChange={async () => {
                    const next = !(toggles[cat] ?? true)
                    setToggles((t) => ({ ...t, [cat]: next }))
                    await setAiCategoryEnabled(cat, next)
                    router.refresh()
                  }}
                  className="rounded border-gray-300 text-[#1a5f3f]"
                />
                {CATEGORY_LABELS[cat] ?? cat}
              </label>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {insights.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No insights yet. Click &quot;Generate insights&quot; to run analysis.</p>
          ) : (
            insights.map((i) => (
              <div key={i.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{i.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{i.whyItMatters}</p>
                    <p className="text-sm text-[#1a5f3f] mt-1"><strong>Suggested:</strong> {i.suggestedAction}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{i.confidencePct}%</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {i.entityId && (
                    <Link href={`/admin/bookings/${i.entityId}`} className="text-xs text-[#1a5f3f] hover:underline">View booking →</Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await snoozeAiInsight(i.id, 24)
                      if (ok.success) { toast.success('Snoozed 24h'); router.refresh() }
                    }}
                    className="text-xs text-gray-600 hover:underline"
                  >
                    Snooze 24h
                  </button>
                  <div className="flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="Action taken"
                      value={actionTakenFor[i.id] ?? ''}
                      onChange={(e) => setActionTakenFor((prev) => ({ ...prev, [i.id]: e.target.value }))}
                      className="border rounded px-2 py-1 text-xs w-40"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const action = actionTakenFor[i.id]?.trim()
                        if (!action) { toast.error('Enter action taken'); return }
                        const ok = await markAiInsightActionTaken(i.id, action)
                        if (ok.success) { setActionTakenFor((p) => ({ ...p, [i.id]: '' })); toast.success('Logged'); router.refresh() }
                      }}
                      className="text-xs text-[#1a5f3f] hover:underline"
                    >
                      Log
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
