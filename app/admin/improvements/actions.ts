'use server'

import { requireAuth } from '@/lib/auth'
import {
  listOpenImprovements,
  listBlockedImprovements,
  listShippedThisWeek,
  listImprovements,
  getImprovement,
  createImprovement,
  updateImprovement,
} from '@/lib/improvements'

export async function listOpenAction() {
  await requireAuth()
  return listOpenImprovements()
}

export async function listBlockedAction() {
  await requireAuth()
  return listBlockedImprovements()
}

export async function listShippedThisWeekAction() {
  await requireAuth()
  return listShippedThisWeek()
}

export async function listImprovementsAction(opts?: { status?: string; source?: string }) {
  await requireAuth()
  return listImprovements(opts)
}

export async function getImprovementAction(id: string) {
  await requireAuth()
  return getImprovement(id)
}

export async function createImprovementAction(data: {
  source: string
  title: string
  impact: string
  effort: string
  urgency?: string
  owner?: string | null
}): Promise<{ success: boolean; item?: Awaited<ReturnType<typeof createImprovement>>; error?: string }> {
  try {
    await requireAuth()
    const item = await createImprovement(data)
    return { success: true, item }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create' }
  }
}

export async function updateImprovementAction(
  id: string,
  data: {
    title?: string
    impact?: string
    effort?: string
    urgency?: string
    owner?: string | null
    status?: string
    outcomeNote?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    return await updateImprovement(id, data)
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update' }
  }
}
