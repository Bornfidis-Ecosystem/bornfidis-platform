'use server'

import { requireAuth } from '@/lib/auth'
import {
  generateAiOpsInsights,
  listAiOpsInsights,
  getCategoryToggles,
  setCategoryEnabled,
  snoozeInsight,
  markActionTaken,
} from '@/lib/ai-ops-insights'

export async function generateInsights(): Promise<{ created: number; error?: string }> {
  try {
    await requireAuth()
    const { created } = await generateAiOpsInsights()
    return { created }
  } catch (e) {
    return { created: 0, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function getAiInsights() {
  await requireAuth()
  return listAiOpsInsights()
}

export async function getAiToggles() {
  await requireAuth()
  return getCategoryToggles()
}

export async function setAiCategoryEnabled(category: string, enabled: boolean): Promise<{ success: boolean }> {
  try {
    await requireAuth()
    await setCategoryEnabled(category, enabled)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function snoozeAiInsight(insightId: string, hours: number = 24): Promise<{ success: boolean }> {
  try {
    await requireAuth()
    const until = new Date()
    until.setHours(until.getHours() + hours)
    const ok = await snoozeInsight(insightId, until)
    return { success: ok }
  } catch {
    return { success: false }
  }
}

export async function markAiInsightActionTaken(insightId: string, action: string, userId?: string | null): Promise<{ success: boolean }> {
  try {
    await requireAuth()
    const ok = await markActionTaken(insightId, action, userId)
    return { success: ok }
  } catch {
    return { success: false }
  }
}
