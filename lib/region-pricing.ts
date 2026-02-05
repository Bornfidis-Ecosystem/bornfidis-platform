/**
 * Phase 2AL — Region-based pricing rules.
 * Application order: base job price → region multiplier → travel fee → minimum → (chef tier & bonus at assignment).
 * Region is locked at booking/quote time; no retroactive changes.
 */

import { db } from '@/lib/db'

export type RegionPricingRow = {
  id: string
  regionCode: string
  name: string | null
  zone: string | null
  multiplier: number
  travelFeeCents: number
  minimumCents: number
  enabled: boolean
}

const DEFAULT_PRICING: RegionPricingRow = {
  id: '',
  regionCode: 'DEFAULT',
  name: 'Default',
  zone: null,
  multiplier: 1.0,
  travelFeeCents: 0,
  minimumCents: 0,
  enabled: true,
}

/** Env: set to "false" to disable region pricing globally (use 1.0, 0, 0). */
export function isRegionPricingEnabled(): boolean {
  const v = process.env.ENABLE_REGION_PRICING
  if (v === undefined || v === '') return true
  return v === 'true' || v === '1'
}

/**
 * Get pricing rule for a region. Returns default if not found or disabled.
 */
export async function getPricingForRegion(regionCode: string | null | undefined): Promise<RegionPricingRow> {
  if (!regionCode?.trim() || !isRegionPricingEnabled()) return DEFAULT_PRICING
  const row = await db.regionPricing.findFirst({
    where: { regionCode: regionCode.trim().toUpperCase(), enabled: true },
  })
  if (!row) return DEFAULT_PRICING
  return {
    id: row.id,
    regionCode: row.regionCode,
    name: row.name,
    zone: row.zone,
    multiplier: row.multiplier,
    travelFeeCents: row.travelFeeCents,
    minimumCents: row.minimumCents,
    enabled: row.enabled,
  }
}

/**
 * Default pricing when no region or no rule exists.
 */
export function getDefaultPricing(): RegionPricingRow {
  return { ...DEFAULT_PRICING }
}

/**
 * Apply region pricing to a base amount (cents).
 * Order: baseCents * multiplier + travelFeeCents, then enforce minimum.
 * Returns { totalCents, multiplier, travelFeeCents, minimumCents, appliedMinimum }.
 */
export function applyRegionToBaseCents(
  baseCents: number,
  pricing: RegionPricingRow
): {
  totalCents: number
  multiplier: number
  travelFeeCents: number
  minimumCents: number
  appliedMinimum: boolean
} {
  if (!isRegionPricingEnabled()) {
    return {
      totalCents: baseCents,
      multiplier: 1.0,
      travelFeeCents: 0,
      minimumCents: 0,
      appliedMinimum: false,
    }
  }
  const afterMultiplier = Math.round(baseCents * pricing.multiplier)
  const afterTravel = afterMultiplier + pricing.travelFeeCents
  const minimum = pricing.minimumCents
  const appliedMinimum = minimum > 0 && afterTravel < minimum
  const totalCents = appliedMinimum ? minimum : afterTravel
  return {
    totalCents,
    multiplier: pricing.multiplier,
    travelFeeCents: pricing.travelFeeCents,
    minimumCents: minimum,
    appliedMinimum,
  }
}

/**
 * Preview: given base subtotal (cents) and region code, return breakdown.
 */
export async function previewRegionPricing(
  baseSubtotalCents: number,
  regionCode: string | null | undefined
): Promise<{
  regionCode: string
  regionName: string | null
  baseCents: number
  afterMultiplierCents: number
  travelFeeCents: number
  afterTravelCents: number
  minimumCents: number
  finalJobCents: number
  appliedMinimum: boolean
}> {
  const pricing = await getPricingForRegion(regionCode)
  const afterMult = Math.round(baseSubtotalCents * pricing.multiplier)
  const afterTravel = afterMult + pricing.travelFeeCents
  const appliedMinimum = pricing.minimumCents > 0 && afterTravel < pricing.minimumCents
  const finalJobCents = appliedMinimum ? pricing.minimumCents : afterTravel
  return {
    regionCode: pricing.regionCode,
    regionName: pricing.name,
    baseCents: baseSubtotalCents,
    afterMultiplierCents: afterMult,
    travelFeeCents: pricing.travelFeeCents,
    afterTravelCents: afterTravel,
    minimumCents: pricing.minimumCents,
    finalJobCents,
    appliedMinimum,
  }
}

/**
 * List all region pricing rules (for admin).
 */
export async function listRegionPricing(enabledOnly = false): Promise<RegionPricingRow[]> {
  const rows = await db.regionPricing.findMany({
    where: enabledOnly ? { enabled: true } : undefined,
    orderBy: { regionCode: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    regionCode: r.regionCode,
    name: r.name,
    zone: r.zone,
    multiplier: r.multiplier,
    travelFeeCents: r.travelFeeCents,
    minimumCents: r.minimumCents,
    enabled: r.enabled,
  }))
}

/**
 * Create or update a region pricing rule (admin).
 */
export async function upsertRegionPricing(data: {
  id?: string
  regionCode: string
  name?: string | null
  zone?: string | null
  multiplier: number
  travelFeeCents: number
  minimumCents: number
  enabled?: boolean
}): Promise<RegionPricingRow> {
  const code = data.regionCode.trim().toUpperCase()
  const payload = {
    regionCode: code,
    name: data.name?.trim() || null,
    zone: data.zone?.trim() || null,
    multiplier: data.multiplier,
    travelFeeCents: data.travelFeeCents,
    minimumCents: data.minimumCents,
    enabled: data.enabled ?? true,
  }
  if (data.id) {
    const updated = await db.regionPricing.update({
      where: { id: data.id },
      data: payload,
    })
    return { ...updated, travelFeeCents: updated.travelFeeCents, minimumCents: updated.minimumCents }
  }
  const created = await db.regionPricing.create({ data: payload })
  return { ...created, travelFeeCents: created.travelFeeCents, minimumCents: created.minimumCents }
}

/**
 * Delete a region pricing rule (admin). Idempotent.
 */
export async function deleteRegionPricing(id: string): Promise<void> {
  await db.regionPricing.delete({ where: { id } }).catch(() => {})
}

/**
 * Toggle enabled for a region (admin).
 */
export async function setRegionPricingEnabled(id: string, enabled: boolean): Promise<void> {
  await db.regionPricing.update({ where: { id }, data: { enabled } })
}
