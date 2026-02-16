import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { getAcademyStats, getAcademyStatsWithPeriod } from '@/lib/academy-stats'

/**
 * Academy revenue metrics (admin only)
 * GET /api/admin/academy/stats
 * Query: ?period=30 — include lifetimeRevenue and last30DaysRevenue
 *
 * Returns: totalRevenue, totalPaidSales, totalFreeClaims, averageOrderValue, revenueByProduct
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const includePeriod = searchParams.get('period') === '30'

  if (includePeriod) {
    const stats = await getAcademyStatsWithPeriod()
    return NextResponse.json(stats)
  }

  const stats = await getAcademyStats()
  return NextResponse.json(stats)
}
