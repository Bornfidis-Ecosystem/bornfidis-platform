import { Suspense } from 'react'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getOpsDashboardData } from '@/lib/ops-dashboard'
import { getForecastData } from '@/lib/forecast'
import { getScenarioInputs, buildScenarios } from '@/lib/scenarios'
import { getCostInsights } from '@/lib/cost-insights'
import { getOKRSnapshotForPeriod } from '@/lib/okrs'
import { getCapacitySnapshot } from '@/lib/capacity-planning'
import { listAiOpsInsights, getCategoryToggles } from '@/lib/ai-ops-insights'
import { getSuccessionSnapshot } from '@/lib/succession'
import { getAiDemandForecastSnapshot } from '@/lib/ai-demand-forecast'
import { getRiskSnapshot } from '@/lib/risks'
import { getGrowthExperimentsSnapshot } from '@/lib/experiments'
import type { DateRangeKey } from '@/lib/ops-dashboard'
import OpsDashboardClient from './OpsDashboardClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AG — Ops Reporting Dashboard
 * Access: ADMIN, STAFF only (not COORDINATOR).
 */
export default async function AdminOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN' && roleStr !== 'STAFF') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Ops dashboard is available to ADMIN and STAFF only.</p>
        <a href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</a>
      </div>
    )
  }

  const params = await searchParams
  const rangeParam = params.range as string | undefined
  const range: DateRangeKey =
    rangeParam === 'today' || rangeParam === '7d' || rangeParam === '30d' ? rangeParam : '7d'

  const now = new Date()
  const okrPeriodKey = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`
  const [data, forecastSnapshot, scenarioInputs, costInsights, okrSnapshot, capacitySnapshot, aiInsights, aiCategoryToggles, successionSnapshot, aiDemandSnapshot, riskSnapshot, growthExperimentsSnapshot] = await Promise.all([
    getOpsDashboardData(range),
    getForecastData(),
    getScenarioInputs(),
    getCostInsights(),
    getOKRSnapshotForPeriod(okrPeriodKey).catch(() => []),
    getCapacitySnapshot().catch(() => null),
    listAiOpsInsights().catch(() => []),
    getCategoryToggles().catch(() => ({})),
    getSuccessionSnapshot().catch(() => null),
    getAiDemandForecastSnapshot().catch(() => null),
    getRiskSnapshot().catch(() => null),
    getGrowthExperimentsSnapshot().catch(() => null),
  ])
  const scenarios = buildScenarios(scenarioInputs)
  const scenarioSnapshot = {
    base30dRevenueCents: scenarios.base.period30.revenueCentsExpected,
    base90dRevenueCents: scenarios.base.period90.revenueCentsExpected,
  }
  const costSnapshot = {
    payoutToRevenuePct: costInsights.labor.payoutToRevenuePct,
    topRecommendation: costInsights.recommendations[0] ?? null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">Command view of operations, quality, and cash flow.</p>
        <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
          <OpsDashboardClient initialData={data} forecastSnapshot={forecastSnapshot} scenarioSnapshot={scenarioSnapshot} costSnapshot={costSnapshot} okrSnapshot={okrSnapshot} capacitySnapshot={capacitySnapshot} aiInsights={aiInsights} aiCategoryToggles={aiCategoryToggles} successionSnapshot={successionSnapshot} aiDemandSnapshot={aiDemandSnapshot} riskSnapshot={riskSnapshot} growthExperimentsSnapshot={growthExperimentsSnapshot} />
        </Suspense>
      </div>
    </div>
  )
}
