/**
 * Phase 2AR — Scenario Planning
 * Best / Base / Worst scenarios for 30d and 90d: revenue, jobs, capacity, cash.
 * Inputs from DB; outputs computed with optional overrides (sliders). No new schema.
 */

import { db } from '@/lib/db'

function revenueCents(b: { quoteTotalCents: number | null; totalCents: number | null }): number {
  const q = b.quoteTotalCents ?? 0
  const t = b.totalCents ?? 0
  return q > 0 ? q : t > 0 ? t : 0
}

export type ScenarioInputs = {
  avgBookingsPerDay: number
  avgOrderValueCents: number
  availableChefDaysPerDay: number
  totalChefDaysPerDay: number
  cancellationRate: number // 0–1
  generatedAt: string
}

export type ScenarioOverrides = {
  demandFactor: number   // e.g. 0.8 = worst, 1.0 = base, 1.2 = best
  capacityFactor: number // e.g. 0.9 = capacity loss, 1.0 = base, 1.0 = full
  pricingFactor: number  // e.g. 1.0 = current, 1.05 = 5% higher
}

export type ScenarioOutput = {
  revenueCentsLow: number
  revenueCentsExpected: number
  revenueCentsHigh: number
  jobsCompleted: number
  requiredChefDays: number
  cashInCents: number
  cashOutCents: number // estimate: ~% of revenue as chef payouts
}

export type ScenarioResult = {
  period30: ScenarioOutput
  period90: ScenarioOutput
}

const CHEF_PAYOUT_PCT = 0.55 // approximate share of revenue to chefs (v1 estimate)

/**
 * Fetch inputs from DB: avg bookings/day, AOV, capacity, cancellation rate.
 */
export async function getScenarioInputs(): Promise<ScenarioInputs> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const hist90Start = new Date(todayStart)
  hist90Start.setDate(hist90Start.getDate() - 90)

  const [bookingsLast90, availableToday, totalToday, cancelledCount] = await Promise.all([
    db.bookingInquiry.findMany({
      where: { eventDate: { gte: hist90Start, lt: todayStart } },
      select: { quoteTotalCents: true, totalCents: true, status: true },
    }),
    db.chefAvailability.count({ where: { date: todayStart, available: true } }),
    db.chefAvailability.count({ where: { date: todayStart } }),
    db.bookingInquiry.count({
      where: {
        createdAt: { gte: hist90Start },
        status: { in: ['Cancelled', 'Canceled', 'cancelled', 'canceled'] },
      },
    }),
  ])

  const totalBookings90 = bookingsLast90.length
  const totalCancelled = cancelledCount
  const totalWithStatus = totalBookings90 + totalCancelled
  const cancellationRate = totalWithStatus > 0 ? totalCancelled / totalWithStatus : 0.05

  const totalRevenue90 = bookingsLast90.reduce((s, b) => s + revenueCents(b), 0)
  const avgOrderValueCents = totalBookings90 > 0 ? Math.round(totalRevenue90 / totalBookings90) : 0
  const avgBookingsPerDay = totalBookings90 / 90

  const availableChefDaysPerDay = availableToday
  const totalChefDaysPerDay = Math.max(totalToday, 1)

  return {
    avgBookingsPerDay: Math.round(avgBookingsPerDay * 100) / 100,
    avgOrderValueCents,
    availableChefDaysPerDay: availableToday,
    totalChefDaysPerDay,
    cancellationRate: Math.round(cancellationRate * 1000) / 1000,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Compute scenario outputs for 30d and 90d given inputs and overrides.
 * demandFactor/capacityFactor/pricingFactor applied to base.
 */
export function computeScenario(
  inputs: ScenarioInputs,
  overrides: ScenarioOverrides,
  days: 30 | 90
): ScenarioOutput {
  const { demandFactor, capacityFactor, pricingFactor } = overrides
  const effectiveRate = 1 - inputs.cancellationRate
  const jobsRaw = inputs.avgBookingsPerDay * days * demandFactor * effectiveRate
  const capacityLimit = (inputs.availableChefDaysPerDay / Math.max(inputs.totalChefDaysPerDay, 1)) * capacityFactor
  const jobsCompleted = Math.round(jobsRaw * Math.min(1, capacityLimit) * 10) / 10
  const revenueExpected = Math.round(jobsCompleted * inputs.avgOrderValueCents * pricingFactor)
  const revenueLow = Math.round(revenueExpected * 0.9)
  const revenueHigh = Math.round(revenueExpected * 1.1)
  const cashInCents = revenueExpected
  const cashOutCents = Math.round(revenueExpected * CHEF_PAYOUT_PCT)
  const requiredChefDays = Math.ceil(jobsCompleted * 1.2) // ~1.2 chef-days per job as proxy

  return {
    revenueCentsLow: revenueLow,
    revenueCentsExpected: revenueExpected,
    revenueCentsHigh: revenueHigh,
    jobsCompleted,
    requiredChefDays,
    cashInCents,
    cashOutCents,
  }
}

/**
 * Build Best / Base / Worst results for 30d and 90d from inputs and optional slider overrides.
 */
export function buildScenarios(
  inputs: ScenarioInputs,
  sliderOverrides?: Partial<ScenarioOverrides>
): { best: ScenarioResult; base: ScenarioResult; worst: ScenarioResult } {
  const base = sliderOverrides ?? {}
  const best: ScenarioOverrides = {
    demandFactor: 1.2,
    capacityFactor: 1.0,
    pricingFactor: 1.05,
  }
  const baseScenario: ScenarioOverrides = {
    demandFactor: base.demandFactor ?? 1.0,
    capacityFactor: base.capacityFactor ?? 1.0,
    pricingFactor: base.pricingFactor ?? 1.0,
  }
  const worst: ScenarioOverrides = {
    demandFactor: 0.75,
    capacityFactor: 0.85,
    pricingFactor: 0.95,
  }

  return {
    best: {
      period30: computeScenario(inputs, best, 30),
      period90: computeScenario(inputs, best, 90),
    },
    base: {
      period30: computeScenario(inputs, baseScenario, 30),
      period90: computeScenario(inputs, baseScenario, 90),
    },
    worst: {
      period30: computeScenario(inputs, worst, 30),
      period90: computeScenario(inputs, worst, 90),
    },
  }
}
