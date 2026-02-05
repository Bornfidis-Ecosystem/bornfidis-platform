/**
 * Phase 2AN — Demand-based surge pricing.
 * Surge applies when: high demand (bookings ≥ X/day in region), low supply (available chefs ≤ Y), or short notice (≤ 48h).
 * Application order: base → region → surge → chef tier → bonus. Surge never affects bonuses. No retroactive surge.
 */

import { db } from '@/lib/db'

export const SURGE_LABEL_CLIENT = 'High-Demand Pricing'

const SURGE_ENABLED_ENV = process.env.ENABLE_SURGE_PRICING !== 'false'

export type SurgeConfigRow = {
  id: string
  regionCode: string
  enabled: boolean
  demandBookingsThreshold: number
  supplyChefsThreshold: number
  shortNoticeHours: number
  surgeMultiplier: number
  minMultiplier: number
  maxMultiplier: number
  expiresAt: Date | null
}

export function isSurgePricingEnabled(): boolean {
  return SURGE_ENABLED_ENV
}

/**
 * Get surge config for region (or DEFAULT for global fallback).
 */
export async function getSurgeConfig(regionCode: string | null | undefined): Promise<SurgeConfigRow | null> {
  if (!regionCode?.trim()) return null
  const code = regionCode.trim().toUpperCase()
  let row = await db.surgeConfig.findUnique({ where: { regionCode: code } })
  if (!row) row = await db.surgeConfig.findUnique({ where: { regionCode: 'DEFAULT' } })
  if (!row || !row.enabled) return null
  if (row.expiresAt && new Date() > row.expiresAt) return null
  return {
    id: row.id,
    regionCode: row.regionCode,
    enabled: row.enabled,
    demandBookingsThreshold: row.demandBookingsThreshold,
    supplyChefsThreshold: row.supplyChefsThreshold,
    shortNoticeHours: row.shortNoticeHours,
    surgeMultiplier: row.surgeMultiplier,
    minMultiplier: row.minMultiplier,
    maxMultiplier: row.maxMultiplier,
    expiresAt: row.expiresAt,
  }
}

/**
 * Count bookings in region on event date (not cancelled).
 */
export async function countBookingsInRegionOnDate(
  regionCode: string,
  eventDate: Date
): Promise<number> {
  const start = new Date(eventDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(eventDate)
  end.setHours(23, 59, 59, 999)
  return db.bookingInquiry.count({
    where: {
      regionCode: regionCode.toUpperCase(),
      eventDate: { gte: start, lte: end },
      status: { notIn: ['Cancelled', 'Canceled'] },
    },
  })
}

/**
 * Count chefs marked available on a given date (ChefAvailability.available = true).
 */
export async function countAvailableChefsOnDate(eventDate: Date): Promise<number> {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  const count = await db.chefAvailability.count({
    where: { date: d, available: true },
  })
  return count
}

/**
 * Event datetime (start of event); reference = now or booking createdAt.
 */
function getEventDateTime(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const [h, m] = eventTime.trim().split(':').map(Number)
    d.setHours(h ?? 0, m ?? 0, 0, 0)
  }
  return d
}

/**
 * True if event is within shortNoticeHours of reference.
 */
export function isShortNotice(
  eventDate: Date,
  eventTime: string | null,
  referenceTime: Date,
  shortNoticeHours: number
): boolean {
  const eventAt = getEventDateTime(eventDate, eventTime)
  const hours = (eventAt.getTime() - referenceTime.getTime()) / (60 * 60 * 1000)
  return hours >= 0 && hours <= shortNoticeHours
}

/**
 * Determine if surge applies and return multiplier (capped). Returns 1.0 if no surge.
 */
export async function getSurgeMultiplier(
  regionCode: string | null | undefined,
  eventDate: Date,
  eventTime: string | null,
  referenceTime: Date = new Date()
): Promise<{ multiplier: number; applied: boolean; reason?: string }> {
  if (!SURGE_ENABLED_ENV) return { multiplier: 1.0, applied: false }

  const config = await getSurgeConfig(regionCode)
  if (!config) return { multiplier: 1.0, applied: false }

  const code = (regionCode || config.regionCode).trim().toUpperCase()
  const eventAt = getEventDateTime(eventDate, eventTime)

  // Short notice: booking within 48h of event
  if (isShortNotice(eventDate, eventTime, referenceTime, config.shortNoticeHours)) {
    const mult = Math.min(Math.max(config.surgeMultiplier, config.minMultiplier), config.maxMultiplier)
    return { multiplier: mult, applied: true, reason: 'short_notice' }
  }

  // High demand: bookings in region on event date >= X
  const bookingsCount = await countBookingsInRegionOnDate(code, eventDate)
  if (bookingsCount >= config.demandBookingsThreshold) {
    const mult = Math.min(Math.max(config.surgeMultiplier, config.minMultiplier), config.maxMultiplier)
    return { multiplier: mult, applied: true, reason: 'high_demand' }
  }

  // Low supply: available chefs on event date <= Y
  const chefsCount = await countAvailableChefsOnDate(eventDate)
  if (chefsCount <= config.supplyChefsThreshold) {
    const mult = Math.min(Math.max(config.surgeMultiplier, config.minMultiplier), config.maxMultiplier)
    return { multiplier: mult, applied: true, reason: 'low_supply' }
  }

  return { multiplier: 1.0, applied: false }
}

/**
 * Apply surge multiplier to job value (after region). Surge never affects bonuses.
 */
export function applySurgeToCents(jobValueCents: number, surgeMultiplier: number): number {
  if (surgeMultiplier <= 1.0) return jobValueCents
  return Math.round(jobValueCents * surgeMultiplier)
}

/**
 * List all surge configs (admin).
 */
export async function listSurgeConfigs(): Promise<SurgeConfigRow[]> {
  const rows = await db.surgeConfig.findMany({ orderBy: { regionCode: 'asc' } })
  return rows.map((r) => ({
    id: r.id,
    regionCode: r.regionCode,
    enabled: r.enabled,
    demandBookingsThreshold: r.demandBookingsThreshold,
    supplyChefsThreshold: r.supplyChefsThreshold,
    shortNoticeHours: r.shortNoticeHours,
    surgeMultiplier: r.surgeMultiplier,
    minMultiplier: r.minMultiplier,
    maxMultiplier: r.maxMultiplier,
    expiresAt: r.expiresAt,
  }))
}

/**
 * Upsert surge config (admin).
 */
export async function upsertSurgeConfig(data: {
  id?: string
  regionCode: string
  enabled?: boolean
  demandBookingsThreshold?: number
  supplyChefsThreshold?: number
  shortNoticeHours?: number
  surgeMultiplier?: number
  minMultiplier?: number
  maxMultiplier?: number
  expiresAt?: Date | null
}): Promise<SurgeConfigRow> {
  const code = data.regionCode.trim().toUpperCase()
  const payload = {
    regionCode: code,
    enabled: data.enabled ?? true,
    demandBookingsThreshold: data.demandBookingsThreshold ?? 5,
    supplyChefsThreshold: data.supplyChefsThreshold ?? 2,
    shortNoticeHours: data.shortNoticeHours ?? 48,
    surgeMultiplier: data.surgeMultiplier ?? 1.15,
    minMultiplier: data.minMultiplier ?? 1.05,
    maxMultiplier: data.maxMultiplier ?? 1.30,
    expiresAt: data.expiresAt ?? null,
  }
  if (data.id) {
    const updated = await db.surgeConfig.update({ where: { id: data.id }, data: payload })
    return { ...updated, demandBookingsThreshold: updated.demandBookingsThreshold, supplyChefsThreshold: updated.supplyChefsThreshold, shortNoticeHours: updated.shortNoticeHours }
  }
  const created = await db.surgeConfig.create({ data: payload })
  return { ...created, demandBookingsThreshold: created.demandBookingsThreshold, supplyChefsThreshold: created.supplyChefsThreshold, shortNoticeHours: created.shortNoticeHours }
}

/**
 * Toggle surge enabled for a region (admin).
 */
export async function setSurgeConfigEnabled(id: string, enabled: boolean): Promise<void> {
  await db.surgeConfig.update({ where: { id }, data: { enabled } })
}

/**
 * Live check: is surge active for this region/date? (for admin map)
 */
export async function isSurgeActiveNow(
  regionCode: string,
  eventDate: Date,
  eventTime: string | null
): Promise<boolean> {
  const { applied } = await getSurgeMultiplier(regionCode, eventDate, eventTime)
  return applied
}
