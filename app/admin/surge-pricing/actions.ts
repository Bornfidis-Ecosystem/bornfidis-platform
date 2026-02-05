'use server'

import { requireAuth } from '@/lib/auth'
import { upsertSurgeConfig, setSurgeConfigEnabled, isSurgeActiveNow } from '@/lib/surge-pricing'

export async function saveSurgeConfig(data: {
  id?: string
  regionCode: string
  enabled?: boolean
  demandBookingsThreshold?: number
  supplyChefsThreshold?: number
  shortNoticeHours?: number
  surgeMultiplier?: number
  minMultiplier?: number
  maxMultiplier?: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await upsertSurgeConfig(data)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save' }
  }
}

export async function toggleSurgeEnabled(id: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await setSurgeConfigEnabled(id, enabled)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to toggle' }
  }
}

export async function checkSurgeActive(regionCode: string, eventDate: string, eventTime: string | null): Promise<boolean> {
  try {
    await requireAuth()
    return isSurgeActiveNow(regionCode, new Date(eventDate), eventTime)
  } catch {
    return false
  }
}
