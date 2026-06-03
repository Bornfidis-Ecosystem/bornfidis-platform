import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { getFounderDashboardMetrics } from '@/lib/founder-dashboard-metrics'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/metrics
 * Founder Dashboard — 5 metrics that drive revenue.
 * Uses getFounderDashboardMetrics() for all values.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const metrics = await getFounderDashboardMetrics()
    return NextResponse.json({
      revenueThisMonthDollars: metrics.revenueThisMonthDollars ?? 0,
      leadsThisWeek: metrics.leadsThisWeek ?? 0,
      emailSubscribers: metrics.emailSubscribers ?? 0,
      emailSubscribersLast30Days: metrics.emailSubscribersLast30Days ?? 0,
      conversionActionsThisMonth: metrics.conversionActionsThisMonth ?? 0,
      activePipelineValueDollars: metrics.activePipelineValueDollars ?? 0,
    })
  } catch (err) {
    console.error('[admin/metrics]', err)
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 })
  }
}
