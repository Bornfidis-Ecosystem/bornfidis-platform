/**
 * Phase 2Z — Coaching workflows. Private (chef + admin only).
 * List cases, assign coach, set plan, clear. Re-evaluate clears when improved.
 */

import { db } from '@/lib/db'
import { checkTriggersForChef } from './coaching-triggers'

export type CoachingCaseWithNames = {
  id: string
  chefId: string
  chefName: string
  reason: string
  status: string
  dueAt: Date | null
  assignedCoachId: string | null
  coachName: string | null
  actionPlanNote: string | null
  resolvedAt: Date | null
  createdAt: Date
}

/**
 * List coaching cases (admin). Filter by status if provided.
 */
export async function listCoachingCases(options?: {
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLEARED'
}): Promise<CoachingCaseWithNames[]> {
  const where = options?.status ? { status: options.status } : {}
  const cases = await db.coachingCase.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      chef: { select: { id: true, name: true } },
      coach: { select: { id: true, name: true } },
    },
  })
  return cases.map((c) => ({
    id: c.id,
    chefId: c.chefId,
    chefName: c.chef.name ?? c.chefId,
    reason: c.reason,
    status: c.status,
    dueAt: c.dueAt,
    assignedCoachId: c.assignedCoachId,
    coachName: c.coach?.name ?? null,
    actionPlanNote: c.actionPlanNote,
    resolvedAt: c.resolvedAt,
    createdAt: c.createdAt,
  }))
}

/**
 * Get open/in-progress cases for a chef (for dashboard banner).
 */
export async function getOpenCasesForChef(chefId: string): Promise<CoachingCaseWithNames[]> {
  const cases = await db.coachingCase.findMany({
    where: { chefId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      chef: { select: { id: true, name: true } },
      coach: { select: { id: true, name: true } },
    },
  })
  return cases.map((c) => ({
    id: c.id,
    chefId: c.chefId,
    chefName: c.chef.name ?? c.chefId,
    reason: c.reason,
    status: c.status,
    dueAt: c.dueAt,
    assignedCoachId: c.assignedCoachId,
    coachName: c.coach?.name ?? null,
    actionPlanNote: c.actionPlanNote,
    resolvedAt: c.resolvedAt,
    createdAt: c.createdAt,
  }))
}

/**
 * Assign coach and/or set action plan and due date.
 */
export async function updateCoachingCase(
  caseId: string,
  data: {
    assignedCoachId?: string | null
    actionPlanNote?: string | null
    dueAt?: Date | null
    status?: 'OPEN' | 'IN_PROGRESS' | 'CLEARED'
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const update: Record<string, unknown> = {}
    if (data.assignedCoachId !== undefined) update.assignedCoachId = data.assignedCoachId
    if (data.actionPlanNote !== undefined) update.actionPlanNote = data.actionPlanNote
    if (data.dueAt !== undefined) update.dueAt = data.dueAt
    if (data.status !== undefined) {
      update.status = data.status
      if (data.status === 'CLEARED') update.resolvedAt = new Date()
    }
    await db.coachingCase.update({
      where: { id: caseId },
      data: update,
    })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to update' }
  }
}

/**
 * Re-evaluate a chef: if no triggers fire anymore, clear open cases for those reasons.
 */
export async function reEvaluateChefAndClearIfImproved(chefId: string): Promise<{ cleared: string[] }> {
  const triggers = await checkTriggersForChef(chefId)
  const triggeredReasons = new Set(triggers.map((t) => t.reason))
  const openCases = await db.coachingCase.findMany({
    where: { chefId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    select: { id: true, reason: true },
  })
  const cleared: string[] = []
  for (const c of openCases) {
    if (!triggeredReasons.has(c.reason as any)) {
      await db.coachingCase.update({
        where: { id: c.id },
        data: { status: 'CLEARED', resolvedAt: new Date() },
      })
      cleared.push(c.id)
    }
  }
  return { cleared }
}
