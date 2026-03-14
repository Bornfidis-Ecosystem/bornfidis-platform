import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/metrics/cash
 * Stub: accepts cash reserve value for future persistence. Returns 200 for now.
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    await request.json() // consume body (e.g. { cashReserveCents: number })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
