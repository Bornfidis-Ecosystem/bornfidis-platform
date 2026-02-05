export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getFeaturedChefIdsForDisplay } from '@/lib/featured-chefs'
import { db } from '@/lib/db'

/**
 * Phase 2X — Public list of featured chefs (for homepage, etc.).
 * GET /api/public/featured-chefs
 * Returns { chefs: { id, name }[] } (max 5). No auth.
 */
export async function GET() {
  try {
    const ids = await getFeaturedChefIdsForDisplay()
    if (ids.length === 0) return NextResponse.json({ chefs: [] })

    const users = await db.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    })
    const order = new Map(ids.map((id, i) => [id, i]))
    const chefs = users
      .map((u) => ({ id: u.id, name: u.name || 'Chef' }))
      .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))

    return NextResponse.json({ chefs })
  } catch (e) {
    console.error('Featured chefs API:', e)
    return NextResponse.json({ chefs: [] })
  }
}
