'use server'

import { requireAuth } from '@/lib/auth'
import {
  listMarginGuardrailConfigs,
  upsertMarginGuardrailConfig,
  listMarginOverrideLogs,
  type MarginGuardrailConfigRow,
} from '@/lib/margin-guardrails'

export async function getConfigs(): Promise<{
  success: boolean
  configs?: MarginGuardrailConfigRow[]
  error?: string
}> {
  try {
    await requireAuth()
    const configs = await listMarginGuardrailConfigs()
    return { success: true, configs }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to load configs',
    }
  }
}

export async function saveConfig(data: {
  id?: string
  regionCode: string | null
  minGrossMarginPct: number
  maxBonusPlusTierPct: number
  maxSurgeMultiplier?: number | null
  minJobValueCents?: number | null
  blockOrWarn: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    return await upsertMarginGuardrailConfig(data)
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to save',
    }
  }
}

export async function getOverrideLog(limit?: number): Promise<{
  success: boolean
  logs?: Awaited<ReturnType<typeof listMarginOverrideLogs>>
  error?: string
}> {
  try {
    await requireAuth()
    const logs = await listMarginOverrideLogs(limit ?? 50)
    return { success: true, logs }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to load audit log',
    }
  }
}
