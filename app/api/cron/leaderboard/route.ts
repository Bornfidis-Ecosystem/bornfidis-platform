import { NextRequest, NextResponse } from 'next/server'
import { recalculateLeaderboard } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 2AA: Leaderboard nightly recalculation.
 * Vercel Cron: set CRON_SECRET in env and protect this route.
 * Schedule e.g. 0 4 * * * (4am daily).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { updated } = await recalculateLeaderboard()
    return NextResponse.json({ ok: true, updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Recalculate failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
