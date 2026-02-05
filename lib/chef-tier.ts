/**
 * Phase 2S — Tiered Chef Rates
 * Standard (1.0), Pro (+10%), Elite (+20%). Tiers earned by criteria; admin can override.
 */

import { db } from '@/lib/db'
import { ChefTier } from '@prisma/client'
import { getEarnedBadgesForUser } from '@/lib/badges'
import { hasRequiredModulesComplete } from '@/lib/education'
import { UserRole } from '@prisma/client'

const RATE_MULTIPLIER: Record<ChefTier, number> = {
  STANDARD: 1.0,
  PRO: 1.1,
  ELITE: 1.2,
}

/** Env: set to "false" to disable tiered rates globally. */
export function isTieredRatesEnabled(): boolean {
  const v = process.env.ENABLE_CHEF_TIERED_RATES
  if (v === undefined || v === '') return true
  return v === 'true' || v === '1'
}

export function getRateMultiplier(tier: ChefTier | string): number {
  const t = String(tier).toUpperCase() as ChefTier
  return RATE_MULTIPLIER[t] ?? 1.0
}

function getScheduledAt(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const parts = eventTime.trim().split(':').map(Number)
    d.setHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0)
  }
  return d
}

async function getOnTimeRateLastN(chefId: string, n: number): Promise<{ ratePercent: number; denom: number }> {
  const assignments = await db.chefAssignment.findMany({
    where: { chefId, status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
    take: n,
    include: {
      booking: {
        select: { eventDate: true, eventTime: true, jobCompletedAt: true },
      },
    },
  })
  let onTime = 0
  let denom = 0
  for (const a of assignments) {
    const at = a.booking.jobCompletedAt
    if (!at) continue
    denom++
    const scheduled = getScheduledAt(a.booking.eventDate, a.booking.eventTime)
    if (new Date(at) <= scheduled) onTime++
  }
  const ratePercent = denom === 0 ? 0 : Math.round((onTime / denom) * 100)
  return { ratePercent, denom }
}

async function hasCertifiedChefBadge(chefId: string): Promise<boolean> {
  const earned = await getEarnedBadgesForUser(chefId)
  return earned.some((b) => b.name === 'Certified Chef')
}

async function hasPrepPerfectBadge(chefId: string): Promise<boolean> {
  const earned = await getEarnedBadgesForUser(chefId)
  return earned.some((b) => b.name === 'Prep Perfect')
}

/**
 * Computed tier from criteria (no admin override).
 * Pro: Certified Chef + ≥90% on-time (last 10)
 * Elite: Pro + Prep Perfect + ≥95% on-time (last 20)
 */
export async function getComputedTier(chefId: string): Promise<ChefTier> {
  const certified = await hasCertifiedChefBadge(chefId)
  const { ratePercent: onTime10 } = await getOnTimeRateLastN(chefId, 10)
  const prepPerfect = await hasPrepPerfectBadge(chefId)
  const { ratePercent: onTime20 } = await getOnTimeRateLastN(chefId, 20)

  if (certified && onTime10 >= 90 && prepPerfect && onTime20 >= 95) return ChefTier.ELITE
  if (certified && onTime10 >= 90) return ChefTier.PRO
  return ChefTier.STANDARD
}

/**
 * Effective tier: admin override if set, else computed.
 */
export async function getEffectiveTier(chefId: string): Promise<ChefTier> {
  const profile = await db.chefProfile.findUnique({
    where: { userId: chefId },
    select: { tierOverride: true },
  })
  if (profile?.tierOverride != null) return profile.tierOverride
  return getComputedTier(chefId)
}

/**
 * Get tier + multiplier for display (chef dashboard, admin). Respects kill-switch.
 */
export async function getChefTierAndMultiplier(chefId: string): Promise<{
  tier: ChefTier
  rateMultiplier: number
  isOverridden: boolean
}> {
  const profile = await db.chefProfile.findUnique({
    where: { userId: chefId },
    select: { tierOverride: true },
  })
  const isOverridden = profile?.tierOverride != null
  const tier = profile?.tierOverride ?? (await getComputedTier(chefId))
  const rateMultiplier = isTieredRatesEnabled() ? getRateMultiplier(tier) : 1.0
  return { tier, rateMultiplier, isOverridden }
}

/**
 * Snapshot tier and multiplier for a booking (lock at assignment time).
 * Call when assigning chef or on first payout calc; do not change after payout is PAID.
 */
export async function getTierSnapshotForChef(chefId: string): Promise<{ tier: ChefTier; multiplier: number }> {
  const tier = await getEffectiveTier(chefId)
  const multiplier = isTieredRatesEnabled() ? getRateMultiplier(tier) : 1.0
  return { tier, multiplier }
}

/** Client-facing label (no rates). */
export function getTierLabel(tier: ChefTier | string): string {
  const t = String(tier).toUpperCase()
  if (t === 'PRO') return 'Pro Chef'
  if (t === 'ELITE') return 'Elite Chef'
  return ''
}
