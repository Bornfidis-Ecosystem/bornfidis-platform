import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { previewRegionPricing } from '@/lib/region-pricing'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AL — Preview region pricing. GET ?baseSubtotalCents=&regionCode=
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const baseSubtotalCents = Number(searchParams.get('baseSubtotalCents')) || 0
    const regionCode = searchParams.get('regionCode')?.trim() || null
    const preview = await previewRegionPricing(baseSubtotalCents, regionCode)
    return NextResponse.json(preview)
  } catch (e) {
    console.error('Region pricing preview error:', e)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
