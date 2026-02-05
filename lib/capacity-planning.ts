/**
 * Phase 2AY — Long-Term Capacity Planning
 * Required chefs by month, gap vs current, hire targets, risk flags.
 * Inputs: historical bookings/day, growth rate, avg jobs per chef/day, attrition, seasonality.
 */

import { db } from '@/lib/db'
import { getForecastData } from '@/lib/forecast'

export type CapacityHorizon = 3 | 6 | 12

export type CapacityInputs = {
  historicalBookingsPerDay: number
  growthRatePctPerMonth: number
  avgJobsPerChefPerDay: number
  attritionRatePctPerMonth: number
  seasonalityMultipliers: number[] | null
  currentActiveChefs: number
  generatedAt: string
}

export type CapacityMonth = {
  monthLabel: string
  monthIndex: number
  projectedBookingsPerDay: number
  requiredChefs: number
  currentCapacity: number
  gap: number
  hireTarget: number
  risk: 'shortfall' | 'surplus' | 'ok'
}

export type CapacityPlan = {
  horizon: CapacityHorizon
  inputs: CapacityInputs
  months: CapacityMonth[]
  riskFlags: { shortfall: boolean; surplus: boolean; summary: string }
}

/**
 * Get or create default capacity config.
 */
async function getCapacityConfig(): Promise<{
  growthRatePctPerMonth: number
  avgJobsPerChefPerDay: number | null
  attritionRatePctPerMonth: number
  seasonalityMultipliers: number[] | null
}> {
  const row = await db.capacityConfig.findFirst({
    where: { label: 'default' },
  })
  if (row) {
    const season = row.seasonalityMultipliers as number[] | null
    return {
      growthRatePctPerMonth: row.growthRatePctPerMonth,
      avgJobsPerChefPerDay: row.avgJobsPerChefPerDay,
      attritionRatePctPerMonth: row.attritionRatePctPerMonth,
      seasonalityMultipliers: Array.isArray(season) ? season : null,
    }
  }
  return {
    growthRatePctPerMonth: 0,
    avgJobsPerChefPerDay: null,
    attritionRatePctPerMonth: 0,
    seasonalityMultipliers: null,
  }
}

export type CapacityConfigRow = {
  id: string
  label: string
  growthRatePctPerMonth: number
  avgJobsPerChefPerDay: number | null
  attritionRatePctPerMonth: number
  seasonalityMultipliers: number[] | null
}

export async function getCapacityConfigForAdmin(): Promise<CapacityConfigRow | null> {
  const row = await db.capacityConfig.findFirst({
    where: { label: 'default' },
  })
  if (!row) return null
  return {
    id: row.id,
    label: row.label,
    growthRatePctPerMonth: row.growthRatePctPerMonth,
    avgJobsPerChefPerDay: row.avgJobsPerChefPerDay,
    attritionRatePctPerMonth: row.attritionRatePctPerMonth,
    seasonalityMultipliers: (row.seasonalityMultipliers as number[]) ?? null,
  }
}

export async function upsertCapacityConfig(data: {
  growthRatePctPerMonth?: number
  avgJobsPerChefPerDay?: number | null
  attritionRatePctPerMonth?: number
  seasonalityMultipliers?: number[] | null
}): Promise<CapacityConfigRow> {
  const existing = await db.capacityConfig.findFirst({
    where: { label: 'default' },
  })
  const payload = {
    growthRatePctPerMonth: data.growthRatePctPerMonth ?? 0,
    avgJobsPerChefPerDay: data.avgJobsPerChefPerDay ?? null,
    attritionRatePctPerMonth: data.attritionRatePctPerMonth ?? 0,
    seasonalityMultipliers: (data.seasonalityMultipliers as any) ?? null,
  }
  if (existing) {
    const r = await db.capacityConfig.update({
      where: { id: existing.id },
      data: payload,
    })
    return {
      id: r.id,
      label: r.label,
      growthRatePctPerMonth: r.growthRatePctPerMonth,
      avgJobsPerChefPerDay: r.avgJobsPerChefPerDay,
      attritionRatePctPerMonth: r.attritionRatePctPerMonth,
      seasonalityMultipliers: (r.seasonalityMultipliers as number[]) ?? null,
    }
  }
  const r = await db.capacityConfig.create({
    data: { label: 'default', ...payload },
  })
  return {
    id: r.id,
    label: r.label,
    growthRatePctPerMonth: r.growthRatePctPerMonth,
    avgJobsPerChefPerDay: r.avgJobsPerChefPerDay,
    attritionRatePctPerMonth: r.attritionRatePctPerMonth,
    seasonalityMultipliers: (r.seasonalityMultipliers as number[]) ?? null,
  }
}

/**
 * Historical bookings per day (last 90 days by event_date).
 */
async function getHistoricalBookingsPerDay(): Promise<number> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const start = new Date(todayStart)
  start.setDate(start.getDate() - 90)

  const count = await db.bookingInquiry.count({
    where: { eventDate: { gte: start, lt: todayStart } },
  })
  const days = 90
  return count / Math.max(days, 1)
}

/**
 * Avg jobs per chef per day (last 90 days: assignments / unique chefs / days).
 */
async function getAvgJobsPerChefPerDay(): Promise<number> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const start = new Date(todayStart)
  start.setDate(start.getDate() - 90)

  const assignments = await db.chefAssignment.findMany({
    where: { booking: { eventDate: { gte: start, lt: todayStart } } },
    select: { chefId: true },
  })
  const totalJobs = assignments.length
  const uniqueChefs = new Set(assignments.map((a) => a.chefId)).size
  if (uniqueChefs === 0) return 1
  const jobsPerChef = totalJobs / uniqueChefs
  return Math.round((jobsPerChef / 90) * 100) / 100
}

/**
 * Current active chefs (have at least one assignment in last 90 days, or use chef_profiles count).
 */
async function getCurrentActiveChefs(): Promise<number> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const start = new Date(todayStart)
  start.setDate(start.getDate() - 90)

  const assignments = await db.chefAssignment.findMany({
    where: { booking: { eventDate: { gte: start, lt: todayStart } } },
    select: { chefId: true },
  })
  const unique = new Set(assignments.map((a) => a.chefId)).size
  if (unique > 0) return unique
  return await db.chefProfile.count()
}

/**
 * Build capacity plan for horizon (3, 6, or 12 months).
 */
export async function getCapacityPlan(horizon: CapacityHorizon): Promise<CapacityPlan> {
  const [config, historicalBookingsPerDay, computedAvgJobs, currentActiveChefs, forecast] =
    await Promise.all([
      getCapacityConfig(),
      getHistoricalBookingsPerDay(),
      getAvgJobsPerChefPerDay(),
      getCurrentActiveChefs(),
      getForecastData().catch(() => null),
    ])

  const avgJobsPerChefPerDay = config.avgJobsPerChefPerDay ?? computedAvgJobs
  const effectiveAvgJobs = avgJobsPerChefPerDay <= 0 ? 1 : avgJobsPerChefPerDay

  let growthRatePctPerMonth = config.growthRatePctPerMonth
  if (growthRatePctPerMonth === 0 && forecast) {
    const b30 = forecast.assumptions.avgBookingsPerDay30
    const b90 = forecast.assumptions.avgBookingsPerDay90
    if (b30 > 0 && b90 > 0) {
      const impliedGrowth = (b90 / b30 - 1) / 2
      growthRatePctPerMonth = Math.round(impliedGrowth * 100 * 100) / 100
    }
  }

  const seasonality = config.seasonalityMultipliers
  const getSeasonality = (monthIndex: number) => {
    if (seasonality && seasonality.length >= 12) return seasonality[monthIndex] ?? 1
    return 1
  }

  const months: CapacityMonth[] = []
  const now = new Date()
  let shortfall = false
  let surplus = false

  for (let i = 1; i <= horizon; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthIndex = d.getMonth()
    const monthLabel = `${d.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}`

    const growthFactor = 1 + growthRatePctPerMonth / 100
    const projectedBookingsPerDay =
      historicalBookingsPerDay * Math.pow(growthFactor, i) * getSeasonality(monthIndex)

    const attritionFactor = 1 - config.attritionRatePctPerMonth / 100
    const effectiveCapacityPerChef = effectiveAvgJobs * Math.pow(attritionFactor, i)
    const requiredChefs = Math.ceil(projectedBookingsPerDay / Math.max(effectiveCapacityPerChef, 0.01))

    const currentCapacity = Math.max(0, Math.round(currentActiveChefs * Math.pow(attritionFactor, i)))
    const gap = requiredChefs - currentCapacity
    const hireTarget = Math.max(0, gap)

    let risk: 'shortfall' | 'surplus' | 'ok' = 'ok'
    if (gap > 0) {
      risk = 'shortfall'
      shortfall = true
    } else if (currentCapacity > requiredChefs * 1.2) {
      risk = 'surplus'
      surplus = true
    }

    months.push({
      monthLabel,
      monthIndex: i,
      projectedBookingsPerDay: Math.round(projectedBookingsPerDay * 100) / 100,
      requiredChefs,
      currentCapacity,
      gap,
      hireTarget,
      risk,
    })
  }

  const summaryParts: string[] = []
  if (shortfall) summaryParts.push('Shortfall in one or more months')
  if (surplus) summaryParts.push('Surplus in one or more months')
  if (summaryParts.length === 0) summaryParts.push('Capacity aligned with demand')

  return {
    horizon,
    inputs: {
      historicalBookingsPerDay: Math.round(historicalBookingsPerDay * 100) / 100,
      growthRatePctPerMonth,
      avgJobsPerChefPerDay: effectiveAvgJobs,
      attritionRatePctPerMonth: config.attritionRatePctPerMonth,
      seasonalityMultipliers: config.seasonalityMultipliers,
      currentActiveChefs,
      generatedAt: new Date().toISOString(),
    },
    months,
    riskFlags: {
      shortfall,
      surplus,
      summary: summaryParts.join('. '),
    },
  }
}

/**
 * Snapshot for Ops Dashboard: current horizon 3 months, gap and risk only.
 */
export async function getCapacitySnapshot(): Promise<{
  horizon: 3
  nextMonth: { requiredChefs: number; gap: number; hireTarget: number; risk: string }
  riskSummary: string
} | null> {
  const plan = await getCapacityPlan(3)
  const next = plan.months[0]
  if (!next) return null
  return {
    horizon: 3,
    nextMonth: {
      requiredChefs: next.requiredChefs,
      gap: next.gap,
      hireTarget: next.hireTarget,
      risk: next.risk,
    },
    riskSummary: plan.riskFlags.summary,
  }
}
