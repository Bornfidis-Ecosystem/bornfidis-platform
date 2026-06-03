import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'
import { getBoardDeckData } from '@/lib/board-deck'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 2AU: Board deck cron — run monthly/quarterly. Returns snapshot JSON.
 * One-click from UI generates PDF; cron stores/sends or returns data for external use.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const period = request.nextUrl.searchParams.get('period') === 'quarter' ? 'quarter' : 'month'

  try {
    const data = await getBoardDeckData(period)
    return NextResponse.json({
      success: true,
      period: data.period,
      periodLabel: data.periodLabel,
      generatedAt: data.generatedAt,
      executiveSummary: data.executiveSummary,
      growth: data.growth,
      quality: data.quality,
      finance: data.finance,
      forecast: data.forecast,
      risksAndActions: data.risksAndActions,
      roadmap: data.roadmap,
    })
  } catch (e) {
    console.error('Board deck cron error:', e)
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to generate deck' },
      { status: 500 }
    )
  }
}
