'use server'

import { requireAuth } from '@/lib/auth'
import {
  getCapacityPlan,
  getCapacityConfigForAdmin,
  upsertCapacityConfig,
  getCapacitySnapshot,
  type CapacityHorizon,
  type CapacityPlan,
  type CapacityConfigRow,
} from '@/lib/capacity-planning'

export async function getPlan(horizon: CapacityHorizon): Promise<CapacityPlan> {
  await requireAuth()
  return getCapacityPlan(horizon)
}

export async function getConfig(): Promise<CapacityConfigRow | null> {
  await requireAuth()
  return getCapacityConfigForAdmin()
}

export async function saveConfig(data: {
  growthRatePctPerMonth?: number
  avgJobsPerChefPerDay?: number | null
  attritionRatePctPerMonth?: number
  seasonalityMultipliers?: number[] | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await upsertCapacityConfig(data)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save' }
  }
}

export async function getSnapshot() {
  await requireAuth()
  return getCapacitySnapshot()
}
