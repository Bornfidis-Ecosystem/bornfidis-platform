/**
 * Phase 2Z — Coaching triggers (v1).
 * Auto-flag if: avg rating < 4.5 (last 10 jobs), on-time < 90%, prep missed 2+ (last 5 jobs).
 */

import { db } from '@/lib/db'

const RATING_THRESHOLD = 4.5
const ON_TIME_THRESHOLD = 90
const PREP_MISSES_THRESHOLD = 2
const LAST_JOBS_FOR_RATING = 10
const LAST_JOBS_FOR_PREP = 5

export const COACHING_REASONS = {
  LOW_RATING: 'LOW_RATING',
  ON_TIME: 'ON_TIME',
  PREP_MISSED: 'PREP_MISSED',
} as const

export type CoachingTrigger = {
  reason: keyof typeof COACHING_REASONS
  detail: string
}

/**
 * Avg rating from reviews for the last N completed assignments (by bookingId).
 */
async function getAvgRatingLastNJobs(chefId: string, n: number): Promise<number | null> {
  const assignments = await db.chefAssignment.findMany({
    where: { chefId, status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
    take: n,
    select: { bookingId: true },
  })
  if (assignments.length === 0) return null
  const bookingIds = assignments.map((a) => a.bookingId)
  const reviews = await db.review.findMany({
    where: { bookingId: { in: bookingIds }, hidden: false },
    select: { rating: true },
  })
  if (reviews.length === 0) return null
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

/**
 * On-time rate (% on time) for last N completed jobs with jobCompletedAt.
 */
async function getOnTimeRateLastN(chefId: string, n: number): Promise<number | null> {
  const assignments = await db.chefAssignment.findMany({
    where: { chefId, status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
    take: n * 2,
    include: {
      booking: {
        select: { eventDate: true, eventTime: true, jobCompletedAt: true },
      },
    },
  })
  let onTime = 0
  let denom = 0
  for (const a of assignments) {
    if (denom >= n) break
    const at = a.booking.jobCompletedAt
    if (!at) continue
    denom++
    const d = new Date(a.booking.eventDate)
    d.setHours(0, 0, 0, 0)
    if (a.booking.eventTime?.trim()) {
      const [h, m] = a.booking.eventTime.trim().split(':').map(Number)
      d.setHours(h ?? 0, m ?? 0, 0, 0)
    }
    if (new Date(at) <= d) onTime++
  }
  if (denom === 0) return null
  return Math.round((onTime / denom) * 100)
}

/**
 * Count of prep checklist misses in last N completed jobs (missing or incomplete checklist).
 */
async function getPrepMissesLastN(chefId: string, n: number): Promise<number> {
  const assignments = await db.chefAssignment.findMany({
    where: { chefId, status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
    take: n,
    select: { bookingId: true },
  })
  const template = await db.prepChecklistTemplate.findFirst({
    where: {},
    orderBy: { createdAt: 'asc' },
  })
  const requiredIndices =
    template?.items && Array.isArray(template.items)
      ? (template.items as { required?: boolean }[])
          .map((item, i) => (item.required ? i : -1))
          .filter((i) => i >= 0)
      : []
  let misses = 0
  for (const a of assignments) {
    const checklist = await db.chefPrepChecklist.findUnique({
      where: { bookingId: a.bookingId },
      include: { template: true },
    })
    if (!checklist) {
      misses++
      continue
    }
    const completedMap = (checklist.completed as Record<string, boolean>) ?? {}
    const tpl = checklist.template ?? template
    const required =
      tpl?.items && Array.isArray(tpl.items)
        ? (tpl.items as { required?: boolean }[])
            .map((item, i) => (item.required ? i : -1))
            .filter((i) => i >= 0)
        : requiredIndices
    const allRequiredChecked =
      required.length === 0 || required.every((i) => completedMap[String(i)] === true)
    if (!allRequiredChecked) misses++
  }
  return misses
}

/**
 * Check all triggers for a chef. Returns list of triggered reasons.
 */
export async function checkTriggersForChef(chefId: string): Promise<CoachingTrigger[]> {
  const [avgRating, onTimePercent, prepMisses] = await Promise.all([
    getAvgRatingLastNJobs(chefId, LAST_JOBS_FOR_RATING),
    getOnTimeRateLastN(chefId, LAST_JOBS_FOR_RATING),
    getPrepMissesLastN(chefId, LAST_JOBS_FOR_PREP),
  ])
  const triggers: CoachingTrigger[] = []
  if (avgRating != null && avgRating < RATING_THRESHOLD) {
    triggers.push({
      reason: 'LOW_RATING',
      detail: `Avg rating ${avgRating.toFixed(1)} (last ${LAST_JOBS_FOR_RATING} jobs) < ${RATING_THRESHOLD}`,
    })
  }
  if (onTimePercent != null && onTimePercent < ON_TIME_THRESHOLD) {
    triggers.push({
      reason: 'ON_TIME',
      detail: `On-time rate ${onTimePercent}% (last ${LAST_JOBS_FOR_RATING} jobs) < ${ON_TIME_THRESHOLD}%`,
    })
  }
  if (prepMisses >= PREP_MISSES_THRESHOLD) {
    triggers.push({
      reason: 'PREP_MISSED',
      detail: `Prep checklist missed ${prepMisses} times in last ${LAST_JOBS_FOR_PREP} jobs`,
    })
  }
  return triggers
}

/**
 * Create an OPEN coaching case if this reason is triggered and no open case exists for this chef+reason.
 */
export async function createCaseIfTriggered(
  chefId: string,
  reason: keyof typeof COACHING_REASONS,
  detail: string
): Promise<{ created: boolean; id?: string }> {
  const existing = await db.coachingCase.findFirst({
    where: { chefId, reason, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    select: { id: true },
  })
  if (existing) return { created: false }
  const due = new Date()
  due.setDate(due.getDate() + 21)
  const c = await db.coachingCase.create({
    data: { chefId, reason, status: 'OPEN', dueAt: due, actionPlanNote: detail },
  })
  return { created: true, id: c.id }
}

/**
 * Evaluate one chef and create cases for any triggered reasons.
 */
export async function evaluateChefAndCreateCases(chefId: string): Promise<{ created: string[] }> {
  const triggers = await checkTriggersForChef(chefId)
  const created: string[] = []
  for (const t of triggers) {
    const result = await createCaseIfTriggered(chefId, t.reason, t.detail)
    if (result.created && result.id) created.push(result.id)
  }
  return { created }
}

/**
 * Evaluate all chefs with assignments and create cases (e.g. from cron).
 */
export async function evaluateAllChefsForCoaching(): Promise<{ chefId: string; caseIds: string[] }[]> {
  const chefs = await db.user.findMany({
    where: { chefAssignments: { some: {} } },
    select: { id: true },
  })
  const results: { chefId: string; caseIds: string[] }[] = []
  for (const chef of chefs) {
    const { created } = await evaluateChefAndCreateCases(chef.id)
    if (created.length > 0) results.push({ chefId: chef.id, caseIds: created })
  }
  return results
}
