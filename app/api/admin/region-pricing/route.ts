import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { listRegionPricing } from '@/lib/region-pricing'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AL — List region pricing rules (admin). GET = list all; no POST here (use server actions or separate route).
 */
export async function GET() {
  try {
    await requireAuth()
    const list = await listRegionPricing(false)
    return NextResponse.json({ regions: list })
  } catch (e) {
    console.error('Region pricing list error:', e)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
