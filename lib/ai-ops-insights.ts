/**
 * Phase 2AZ — AI-Assisted Ops Insights
 * Rules + lightweight scoring; confidence per insight; snooze and action log.
 */

import { db } from '@/lib/db'
import { getOpsDashboardData } from '@/lib/ops-dashboard'
import { getCapacitySnapshot } from '@/lib/capacity-planning'

export const AI_OPS_CATEGORIES = [
  'at_risk_booking',
  'quality_risk',
  'cost_leak',
  'capacity_gap',
] as const

export type AiOpsCategory = (typeof AI_OPS_CATEGORIES)[number]

export type AiOpsInsightRow = {
  id: string
  category: string
  title: string
  whyItMatters: string
  suggestedAction: string
  confidencePct: number
  entityType: string
  entityId: string | null
  metadata: unknown
  createdAt: Date
  snoozedUntil: Date | null
  actionTaken: string | null
  actionTakenAt: Date | null
  actionTakenBy: string | null
}

/**
 * Run nightly-style analysis and persist insights. Idempotent: skips creating duplicate (same entityId+category) within last 24h.
 */
export async function generateAiOpsInsights(): Promise<{ created: number }> {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setHours(cutoff.getHours() - 24)

  const [ops, capacity] = await Promise.all([
    getOpsDashboardData('30d'),
    getCapacitySnapshot().catch(() => null),
  ])

  let created = 0

  // At-risk bookings (from ops atRisk)
  for (const row of ops.atRisk.slice(0, 20)) {
    const existing = await db.aiOpsInsight.findFirst({
      where: {
        entityId: row.bookingId,
        category: 'at_risk_booking',
        createdAt: { gte: cutoff },
      },
    })
    if (existing) continue

    const reasonLabel = row.reason === 'low_rating' ? 'Low rating' : row.reason === 'late' ? 'Late completion' : 'Missed prep'
    await db.aiOpsInsight.create({
      data: {
        category: 'at_risk_booking',
        title: `At-risk: ${row.bookingName} — ${reasonLabel}`,
        whyItMatters: row.detail,
        suggestedAction: `Review booking and chef; follow up with client or reassign if needed.`,
        confidencePct: 85,
        entityType: 'booking',
        entityId: row.bookingId,
        metadata: { reason: row.reason, chefId: row.chefId, eventDate: row.eventDate },
      },
    })
    created++
  }

  // Quality risks (aggregate: rating dips, missed prep — already in atRisk; add one summary if many)
  if (ops.atRisk.length >= 5) {
    const qualityReasons = ops.atRisk.filter((r) => r.reason === 'low_rating' || r.reason === 'missed_prep')
    if (qualityReasons.length >= 3) {
      const existing = await db.aiOpsInsight.findFirst({
        where: {
          category: 'quality_risk',
          entityId: null,
          createdAt: { gte: cutoff },
        },
      })
      if (!existing) {
        await db.aiOpsInsight.create({
          data: {
            category: 'quality_risk',
            title: `Quality: ${qualityReasons.length} bookings with low rating or missed prep`,
            whyItMatters: 'Repeated quality issues can hurt reputation and retention.',
            suggestedAction: 'Review coaching cases; consider prep reminders or chef support.',
            confidencePct: 80,
            entityType: 'system',
            entityId: null,
            metadata: { count: qualityReasons.length },
          },
        })
        created++
      }
    }
  }

  // Cost leaks: surge overuse, reassignments — simple rule
  const withSurge = await db.bookingInquiry.count({
    where: {
      surgeMultiplierSnapshot: { not: null },
      eventDate: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: now },
    },
  })
  if (withSurge >= 10) {
    const existing = await db.aiOpsInsight.findFirst({
      where: {
        category: 'cost_leak',
        entityId: null,
        createdAt: { gte: cutoff },
      },
    })
    if (!existing) {
      await db.aiOpsInsight.create({
        data: {
          category: 'cost_leak',
          title: `Cost: ${withSurge} bookings used surge pricing this month`,
          whyItMatters: 'High surge use can compress margins and discourage bookings.',
          suggestedAction: 'Review surge thresholds and regional capacity; consider incentives to increase availability.',
          confidencePct: 75,
          entityType: 'system',
          entityId: null,
          metadata: { surgeCount: withSurge },
        },
      })
      created++
    }
  }

  // Capacity gap (from capacity snapshot)
  if (capacity && capacity.nextMonth.gap > 0) {
    const existing = await db.aiOpsInsight.findFirst({
      where: {
        category: 'capacity_gap',
        entityId: null,
        createdAt: { gte: cutoff },
      },
    })
    if (!existing) {
      await db.aiOpsInsight.create({
        data: {
          category: 'capacity_gap',
          title: `Capacity: Next month shortfall of ${capacity.nextMonth.gap} chefs (hire target: ${capacity.nextMonth.hireTarget})`,
          whyItMatters: capacity.riskSummary,
          suggestedAction: 'Trigger chef recruitment; adjust incentives or regional focus to fill gap.',
          confidencePct: 90,
          entityType: 'system',
          entityId: null,
          metadata: {
            requiredChefs: capacity.nextMonth.requiredChefs,
            gap: capacity.nextMonth.gap,
            hireTarget: capacity.nextMonth.hireTarget,
          },
        },
      })
      created++
    }
  }

  return { created }
}

/**
 * Get category toggles (default all enabled).
 */
export async function getCategoryToggles(): Promise<Record<string, boolean>> {
  const rows = await db.aiOpsCategoryToggle.findMany()
  const out: Record<string, boolean> = {}
  for (const c of AI_OPS_CATEGORIES) {
    out[c] = rows.find((r) => r.category === c)?.enabled ?? true
  }
  return out
}

/**
 * Set one category on/off.
 */
export async function setCategoryEnabled(category: string, enabled: boolean): Promise<void> {
  await db.aiOpsCategoryToggle.upsert({
    where: { category },
    create: { category, enabled },
    update: { enabled },
  })
}

/**
 * List insights for dashboard: respect toggles, hide snoozed, limit 50.
 */
export async function listAiOpsInsights(options?: {
  categories?: string[]
  includeSnoozed?: boolean
  limit?: number
}): Promise<AiOpsInsightRow[]> {
  const toggles = await getCategoryToggles()
  const enabledCategories = options?.categories ?? AI_OPS_CATEGORIES.filter((c) => toggles[c])
  const now = new Date()
  const limit = options?.limit ?? 50

  const where: any = {
    category: { in: enabledCategories },
  }
  if (!options?.includeSnoozed) {
    where.OR = [
      { snoozedUntil: null },
      { snoozedUntil: { lt: now } },
    ]
  }

  const rows = await db.aiOpsInsight.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    whyItMatters: r.whyItMatters,
    suggestedAction: r.suggestedAction,
    confidencePct: r.confidencePct,
    entityType: r.entityType,
    entityId: r.entityId,
    metadata: r.metadata,
    createdAt: r.createdAt,
    snoozedUntil: r.snoozedUntil,
    actionTaken: r.actionTaken,
    actionTakenAt: r.actionTakenAt,
    actionTakenBy: r.actionTakenBy,
  }))
}

/**
 * Get insights for a specific booking (inline warnings on booking detail).
 */
export async function getInsightsForBooking(bookingId: string): Promise<AiOpsInsightRow[]> {
  const now = new Date()
  const rows = await db.aiOpsInsight.findMany({
    where: {
      entityId: bookingId,
      OR: [{ snoozedUntil: null }, { snoozedUntil: { lt: now } }],
      actionTaken: null,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    whyItMatters: r.whyItMatters,
    suggestedAction: r.suggestedAction,
    confidencePct: r.confidencePct,
    entityType: r.entityType,
    entityId: r.entityId,
    metadata: r.metadata,
    createdAt: r.createdAt,
    snoozedUntil: r.snoozedUntil,
    actionTaken: r.actionTaken,
    actionTakenAt: r.actionTakenAt,
    actionTakenBy: r.actionTakenBy,
  }))
}

/**
 * Snooze an insight until a given time (e.g. 24h to avoid spam).
 */
export async function snoozeInsight(insightId: string, until: Date): Promise<boolean> {
  const r = await db.aiOpsInsight.update({
    where: { id: insightId },
    data: { snoozedUntil: until },
  }).catch(() => null)
  return !!r
}

/**
 * Log action taken on an insight.
 */
export async function markActionTaken(
  insightId: string,
  action: string,
  userId?: string | null
): Promise<boolean> {
  const r = await db.aiOpsInsight.update({
    where: { id: insightId },
    data: {
      actionTaken: action,
      actionTakenAt: new Date(),
      actionTakenBy: userId ?? null,
    },
  }).catch(() => null)
  return !!r
}
