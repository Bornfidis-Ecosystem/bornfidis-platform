/**
 * Phase 2P — Badges & Certifications
 * Auto-award when criteria met; read-only for chefs.
 */

import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { hasRequiredModulesComplete } from '@/lib/education'

export type BadgeWithAwarded = {
  id: string
  name: string
  criteria: string
  awardedAt: Date | null
}

/**
 * Get badges earned by a user (for display). Returns badge info + awardedAt if earned.
 */
export async function getBadgesForUser(userId: string): Promise<BadgeWithAwarded[]> {
  const badges = await db.badge.findMany({
    where: { role: UserRole.CHEF },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, criteria: true },
  })
  const awarded = await db.userBadge.findMany({
    where: { userId },
    select: { badgeId: true, awardedAt: true },
  })
  const byBadge = Object.fromEntries(awarded.map((a) => [a.badgeId, a.awardedAt]))
  return badges.map((b) => ({
    id: b.id,
    name: b.name,
    criteria: b.criteria,
    awardedAt: byBadge[b.id] ?? null,
  }))
}

/**
 * Return only earned badges (for strip/summary).
 */
export async function getEarnedBadgesForUser(userId: string): Promise<Array<{ id: string; name: string; criteria: string; awardedAt: Date }>> {
  const all = await getBadgesForUser(userId)
  return all.filter((b): b is typeof b & { awardedAt: Date } => b.awardedAt != null)
}

// ---------------------------------------------------------------------------
// Phase 2R — Client-facing trust badges (public only; no dates/metrics)
// ---------------------------------------------------------------------------

/** Badge IDs that are shown to clients (v1: Certified Chef, On-Time Pro, Prep Perfect). */
export const PUBLIC_BADGE_IDS = ['badge_certified_chef', 'badge_on_time_pro', 'badge_prep_perfect'] as const

/** Icon key per badge id for public API. */
export const PUBLIC_BADGE_ICON: Record<string, string> = {
  badge_certified_chef: 'certified',
  badge_on_time_pro: 'on_time',
  badge_prep_perfect: 'prep_perfect',
}

export type PublicTrustBadge = { name: string; icon: string }

/**
 * Get earned public trust badges for a chef (max 3, order: Certified → On-Time → Prep).
 * Used by GET /api/public/chefs/[id]/badges. Revoked badges disappear (we only read current UserBadge).
 */
export async function getPublicEarnedBadgesForChef(chefId: string): Promise<PublicTrustBadge[]> {
  const awarded = await db.userBadge.findMany({
    where: {
      userId: chefId,
      badgeId: { in: [...PUBLIC_BADGE_IDS] },
    },
    select: { badgeId: true },
  })
  const badgeIds = awarded.map((a) => a.badgeId)
  if (badgeIds.length === 0) return []

  const badges = await db.badge.findMany({
    where: { id: { in: badgeIds } },
    select: { id: true, name: true },
  })
  const byId = Object.fromEntries(badges.map((b) => [b.id, b]))

  const out: PublicTrustBadge[] = []
  for (const id of PUBLIC_BADGE_IDS) {
    if (byId[id] && out.length < 3) {
      out.push({
        name: byId[id].name,
        icon: PUBLIC_BADGE_ICON[id] ?? id.replace('badge_', '').replace(/_/g, '_'),
      })
    }
  }
  return out
}

/** Build scheduled datetime for on-time check */
function getScheduledAt(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const parts = eventTime.trim().split(':').map(Number)
    d.setHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0)
  }
  return d
}

/** Check if last N completed jobs meet on-time ≥ threshold (percent). */
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

/** Check if last N completed jobs have 100% prep completion. */
async function getPrepPerfectLastN(chefId: string, n: number): Promise<boolean> {
  const assignments = await db.chefAssignment.findMany({
    where: { chefId, status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
    take: n,
  })
  if (assignments.length === 0) return false
  const template = await db.prepChecklistTemplate.findFirst({ where: {}, orderBy: { createdAt: 'asc' } })
  const required =
    template?.items && Array.isArray(template.items)
      ? (template.items as { required?: boolean }[])
          .map((item, i) => (item.required ? i : -1))
          .filter((i) => i >= 0)
      : []
  for (const a of assignments) {
    const checklist = await db.chefPrepChecklist.findUnique({
      where: { bookingId: a.bookingId },
      include: { template: true },
    })
    if (!checklist) return false
    const templateForChecklist = checklist.template ?? template
    const req =
      templateForChecklist?.items && Array.isArray(templateForChecklist.items)
        ? (templateForChecklist.items as { required?: boolean }[])
            .map((item, i) => (item.required ? i : -1))
            .filter((i) => i >= 0)
        : required
    const completed = (checklist.completed as Record<string, boolean>) ?? {}
    const allChecked = req.length === 0 || req.every((i) => completed[String(i)] === true)
    if (!allChecked) return false
  }
  return true
}

/**
 * Check all badge criteria for a chef and award any newly earned badges (idempotent).
 * Call after education completion and after job completion (status → COMPLETED).
 */
export async function checkAndAwardBadges(chefId: string): Promise<void> {
  const badges = await db.badge.findMany({
    where: { role: UserRole.CHEF },
    select: { id: true, name: true },
  })
  const byName = Object.fromEntries(badges.map((b) => [b.name, b.id]))

  const toAward: string[] = []

  // Certified Chef — all required education complete
  if (byName['Certified Chef']) {
    const ok = await hasRequiredModulesComplete(chefId, UserRole.CHEF)
    if (ok) toAward.push(byName['Certified Chef'])
  }

  // Food Safety Ready — completed module with "Food Safety" in title
  if (byName['Food Safety Ready']) {
    const mod = await db.educationModule.findFirst({
      where: { role: UserRole.CHEF, title: { contains: 'Food Safety', mode: 'insensitive' } },
      select: { id: true },
    })
    if (mod) {
      const prog = await db.educationProgress.findUnique({
        where: { userId_moduleId: { userId: chefId, moduleId: mod.id } },
      })
      if (prog?.completed) toAward.push(byName['Food Safety Ready'])
    }
  }

  // On-Time Pro — ≥95% on-time on last 10 jobs
  if (byName['On-Time Pro']) {
    const { ratePercent, denom } = await getOnTimeRateLastN(chefId, 10)
    if (denom >= 1 && ratePercent >= 95) toAward.push(byName['On-Time Pro'])
  }

  // Prep Perfect — 100% prep on last 5 jobs
  if (byName['Prep Perfect']) {
    const ok = await getPrepPerfectLastN(chefId, 5)
    if (ok) toAward.push(byName['Prep Perfect'])
  }

  for (const badgeId of toAward) {
    await db.userBadge.upsert({
      where: {
        userId_badgeId: { userId: chefId, badgeId },
      },
      update: {},
      create: { userId: chefId, badgeId },
    })
  }
}
