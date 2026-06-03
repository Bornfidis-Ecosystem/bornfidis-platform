import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { getFounderDashboardTrends } from '@/lib/founder-dashboard-trends'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/trends
 * Founder Dashboard — revenue trend (30d/90d), provisions funnel counts, email growth by week.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const trends = await getFounderDashboardTrends()
    return NextResponse.json(trends)
  } catch (err) {
    console.error('[admin/trends]', err)
    return NextResponse.json(
      {
        revenueTrend: {
          last30Days: { totalCents: 0, academyCents: 0, provisionsCents: 0, sportswearCents: 0 },
          last90Days: { totalCents: 0, academyCents: 0, provisionsCents: 0, sportswearCents: 0 },
        },
        provisionsFunnel: [],
        emailGrowth: [],
      },
      { status: 200 }
    )
  }
}
