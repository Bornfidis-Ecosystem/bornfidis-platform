import { NextRequest, NextResponse } from 'next/server'
import { getInvestorReportData } from '@/lib/investor-report'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 2AS: Investor report cron — run monthly (and optionally quarterly).
 * Pulls from ops + forecast; returns snapshot JSON. One-click regenerate / resend can use this or page.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await getInvestorReportData()
    return NextResponse.json({
      success: true,
      periodLabel: data.periodLabel,
      generatedAt: data.generatedAt,
      revenue: data.revenue,
      growth: data.growth,
      quality: data.quality,
      unitEconomics: data.unitEconomics,
      outlook: data.outlook,
    })
  } catch (e) {
    console.error('Investor report cron error:', e)
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to generate report' },
      { status: 500 }
    )
  }
}
