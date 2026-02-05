'use server'

import { requireAuth } from '@/lib/auth'
import {
  upsertRegionPricing,
  deleteRegionPricing,
  setRegionPricingEnabled,
  previewRegionPricing,
} from '@/lib/region-pricing'

export async function saveRegion(data: {
  id?: string
  regionCode: string
  name?: string | null
  zone?: string | null
  multiplier: number
  travelFeeCents: number
  minimumCents: number
  enabled?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await upsertRegionPricing(data)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save' }
  }
}

export async function removeRegion(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await deleteRegionPricing(id)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete' }
  }
}

export async function toggleRegionEnabled(id: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await setRegionPricingEnabled(id, enabled)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to toggle' }
  }
}

export async function getPreview(
  baseSubtotalCents: number,
  regionCode: string | null
): Promise<{ success: boolean; preview?: Awaited<ReturnType<typeof previewRegionPricing>>; error?: string }> {
  try {
    await requireAuth()
    const preview = await previewRegionPricing(baseSubtotalCents, regionCode)
    return { success: true, preview }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to preview' }
  }
}
