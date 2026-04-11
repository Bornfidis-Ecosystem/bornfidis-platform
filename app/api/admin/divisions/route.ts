import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { getAdminDivisionsData } from '@/lib/admin-divisions-data'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/divisions
 * Zone 2: Sportswear, Academy, Provisions, ProJu metrics.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const data = await getAdminDivisionsData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[admin/divisions]', err)
    return NextResponse.json(
      { error: 'Failed to load division metrics' },
      { status: 500 }
    )
  }
}
