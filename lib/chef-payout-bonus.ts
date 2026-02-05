/**
 * Phase 2Q — Performance-based payout bonuses
 * On-Time Pro +5%, Prep Perfect +3%, Certified Chef +2%. Cap +10%.
 * Bonuses only if required education complete; no changes after PAID.
 */

import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { hasRequiredModulesComplete } from '@/lib/education'
import { getEarnedBadgesForUser } from '@/lib/badges'

const BONUS_PCT_BY_BADGE: Record<string, number> = {
  'On-Time Pro': 5,
  'Prep Perfect': 3,
  'Certified Chef': 2,
}

const CAP_PCT = 10

/** Env: set to "false" to disable bonuses globally (no redeploy to toggle via env file). */
export function isChefPayoutBonusEnabled(): boolean {
  const v = process.env.ENABLE_CHEF_PAYOUT_BONUSES
  if (v === undefined || v === '') return true
  return v === 'true' || v === '1'
}

export type BonusBreakdownItem = { badge: string; pct: number }

export type ChefPayoutWithBonus = {
  baseCents: number
  bonusCents: number
  totalCents: number
  breakdown: BonusBreakdownItem[]
}

/**
 * Compute bonus % from earned badges (by name). Cap at CAP_PCT.
 * Returns 0 if required education not complete.
 */
export async function getChefBonusPct(chefId: string): Promise<{ pct: number; breakdown: BonusBreakdownItem[] }> {
  const earned = await getEarnedBadgesForUser(chefId)
  const breakdown: BonusBreakdownItem[] = []
  let pct = 0
  for (const b of earned) {
    const add = BONUS_PCT_BY_BADGE[b.name]
    if (add != null) {
      breakdown.push({ badge: b.name, pct: add })
      pct += add
    }
  }
  pct = Math.min(pct, CAP_PCT)
  return { pct, breakdown }
}

/**
 * Compute total payout from base: base + bonus (if enabled, education complete, not overridden).
 * Use when creating or updating chef payout. Do not change after status PAID.
 */
export async function computeChefPayoutWithBonus(
  chefId: string,
  baseAmountCents: number,
  options: { override?: boolean; status?: string | null } = {}
): Promise<ChefPayoutWithBonus> {
  const override = options.override === true
  const status = (options.status ?? '').toLowerCase()

  if (baseAmountCents <= 0) {
    return { baseCents: baseAmountCents, bonusCents: 0, totalCents: baseAmountCents, breakdown: [] }
  }

  // No retroactive change after PAID
  if (status === 'paid') {
    return { baseCents: baseAmountCents, bonusCents: 0, totalCents: baseAmountCents, breakdown: [] }
  }

  if (!isChefPayoutBonusEnabled() || override) {
    return { baseCents: baseAmountCents, bonusCents: 0, totalCents: baseAmountCents, breakdown: [] }
  }

  const educationComplete = await hasRequiredModulesComplete(chefId, UserRole.CHEF)
  if (!educationComplete) {
    return { baseCents: baseAmountCents, bonusCents: 0, totalCents: baseAmountCents, breakdown: [] }
  }

  const { pct, breakdown } = await getChefBonusPct(chefId)
  if (pct === 0) {
    return { baseCents: baseAmountCents, bonusCents: 0, totalCents: baseAmountCents, breakdown: [] }
  }

  const bonusCents = Math.round(baseAmountCents * (pct / 100))
  const totalCents = baseAmountCents + bonusCents
  return { baseCents: baseAmountCents, bonusCents, totalCents, breakdown }
}
