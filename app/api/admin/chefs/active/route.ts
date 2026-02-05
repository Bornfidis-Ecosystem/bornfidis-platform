export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase'
import { getFeaturedChefIdsForDisplay } from '@/lib/featured-chefs'
import { getEffectiveTier, getTierLabel } from '@/lib/chef-tier'
import { ChefTier } from '@prisma/client'

const TIER_ORDER: Record<ChefTier, number> = {
  ELITE: 0,
  PRO: 1,
  STANDARD: 2,
}

/**
 * Phase 5A: Get active chefs (for assignment dropdown).
 * Phase 2X: Order = Featured first, then Elite → Pro → Standard, then name. Each chef includes featured + tierLabel.
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { data: chefs, error } = await supabaseAdmin
      .from('chefs')
      .select('*')
      .in('status', ['active', 'approved'])
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching active chefs:', error)
      return NextResponse.json({ success: true, chefs: [] }, { status: 200 })
    }

    const list = chefs || []
    if (list.length === 0) return NextResponse.json({ success: true, chefs: [] })

    const featuredIds = new Set(await getFeaturedChefIdsForDisplay())
    const withMeta = await Promise.all(
      list.map(async (c: { id: string; name: string; specialties?: string[] }) => {
        const tier = await getEffectiveTier(c.id)
        const tierLabel = getTierLabel(tier)
        return {
          id: c.id,
          name: c.name,
          specialties: c.specialties ?? [],
          featured: featuredIds.has(c.id),
          tier: tier,
          tierLabel: tierLabel || undefined,
        }
      })
    )

    withMeta.sort((a, b) => {
      const aFeatured = a.featured ? 0 : 1
      const bFeatured = b.featured ? 0 : 1
      if (aFeatured !== bFeatured) return aFeatured - bFeatured
      const aTier = TIER_ORDER[a.tier] ?? 2
      const bTier = TIER_ORDER[b.tier] ?? 2
      if (aTier !== bTier) return aTier - bTier
      return (a.name || '').localeCompare(b.name || '')
    })

    return NextResponse.json({
      success: true,
      chefs: withMeta.map(({ id, name, specialties, featured, tierLabel }) => ({
        id,
        name,
        specialties,
        featured,
        tierLabel,
      })),
    })
  } catch (error) {
    console.error('Error fetching active chefs:', error)
    return NextResponse.json({ success: true, chefs: [] }, { status: 200 })
  }
}
