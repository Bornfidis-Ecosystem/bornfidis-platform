'use server'

import { requireAuth } from '@/lib/auth'
import { updateCoachingCase, reEvaluateChefAndClearIfImproved } from '@/lib/coaching'
import { evaluateChefAndCreateCases, evaluateAllChefsForCoaching } from '@/lib/coaching-triggers'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

/**
 * Phase 2Z — Update coaching case (assign coach, plan, due, status).
 */
export async function updateCoachingCaseAction(
  caseId: string,
  data: {
    assignedCoachId?: string | null
    actionPlanNote?: string | null
    dueAt?: string | null
    status?: 'OPEN' | 'IN_PROGRESS' | 'CLEARED'
  }
) {
  await requireAuth()
  const dueAt = data.dueAt ? new Date(data.dueAt) : undefined
  return updateCoachingCase(caseId, {
    ...data,
    dueAt: dueAt ?? (data.dueAt === null ? null : undefined),
  })
}

/**
 * Re-evaluate chef and clear cases if metrics improved.
 */
export async function reEvaluateChefAction(chefId: string) {
  await requireAuth()
  return reEvaluateChefAndClearIfImproved(chefId)
}

/**
 * Run triggers for one chef and create cases if needed.
 */
export async function runTriggersForChefAction(chefId: string) {
  await requireAuth()
  return evaluateChefAndCreateCases(chefId)
}

/**
 * Evaluate all chefs and create coaching cases where triggers fire.
 * Used by EvaluateAllButton.
 */
export async function evaluateAllChefsAction(): Promise<{
  success: boolean
  created?: number
  chefsAffected?: number
  error?: string
}> {
  try {
    await requireAuth()
    const results = await evaluateAllChefsForCoaching()
    const created = results.reduce((sum, r) => sum + r.caseIds.length, 0)
    return { success: true, created, chefsAffected: results.length }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed'
    return { success: false, error: message }
  }
}

/**
 * List users who can be assigned as coach (ADMIN, STAFF).
 */
export async function getCoachOptions(): Promise<Array<{ id: string; name: string | null }>> {
  await requireAuth()
  const users = await db.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.STAFF] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return users.map((u) => ({ id: u.id, name: u.name }))
}
