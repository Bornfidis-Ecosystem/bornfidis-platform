/**
 * Phase 2BB — AI Demand Forecasting
 * Lightweight time-series baseline + trend; confidence bands (low/base/high); horizons 30/90/180 days.
 * Inputs: historical bookings, recent trends (14–30d), capacity. No heavy ML.
 */

import { db } from '@/lib/db'
import { getForecastData } from '@/lib/forecast'
import { getCapacityPlan } from '@/lib/capacity-planning'
import type { CapacityHorizon } from '@/lib/capacity-planning'

const CONFIRMED_STATUS = 'Confirmed'

export type HorizonBand = {
  low: number
  base: number
  high: number
}

export type RegionForecast = {
  regionCode: string
  regionName: string
  period30: HorizonBand   // bookings count
  period90: HorizonBand
  period180: HorizonBand
}

export type PeakDay = {
  date: string   // YYYY-MM-DD
  projectedBookings: number
  dayOfWeek: string
  reason?: string
}

export type CapacityShortfall = {
  monthLabel: string
  gap: number
  requiredChefs: number
  hireTarget: number
  risk: string
}

export type ActionSuggestion = {
  action: string
  reason: string
  href: string
}

export type AiDemandForecast = {
  generatedAt: string
  horizons: { days: 30 | 90 | 180; label: string }[]
  byRegion: RegionForecast[]
  peakDays: PeakDay[]
  capacityShortfalls: CapacityShortfall[]
  revenueImpact: {
    period30: HorizonBand   // cents
    period90: HorizonBand
    period180: HorizonBand
  }
  actionSuggestions: ActionSuggestion[]
  inputs: {
    avgBookingsPerDay30: number
    trendPct: number
    avgOrderValueCents: number
    note: string
  }
}

const CONFIDENCE_LOW = 0.85
const CONFIDENCE_HIGH = 1.15

/**
 * Historical bookings by region and by day (last N days by event_date).
 */
async function getHistoricalByRegionAndDay(days: number): Promise<{
  byRegion: Map<string, number>
  byDay: Map<string, number>
  total: number
}> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const start = new Date(todayStart)
  start.setDate(start.getDate() - days)

  const bookings = await db.bookingInquiry.findMany({
    where: {
      status: CONFIRMED_STATUS,
      eventDate: { gte: start, lt: todayStart },
    },
    select: { eventDate: true, regionCode: true },
  })

  const byRegion = new Map<string, number>()
  const byDay = new Map<string, number>()
  for (const b of bookings) {
    const dateKey = b.eventDate instanceof Date ? b.eventDate.toISOString().slice(0, 10) : String(b.eventDate).slice(0, 10)
    byDay.set(dateKey, (byDay.get(dateKey) ?? 0) + 1)
    const region = (b.regionCode ?? 'DEFAULT').trim() || 'DEFAULT'
    byRegion.set(region, (byRegion.get(region) ?? 0) + 1)
  }
  return { byRegion, byDay, total: bookings.length }
}

/**
 * Trend: (last 14d - previous 14d) / previous 14d as decimal.
 */
async function getTrendPct(): Promise<number> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const last14Start = new Date(todayStart)
  last14Start.setDate(last14Start.getDate() - 14)
  const prev14Start = new Date(todayStart)
  prev14Start.setDate(prev14Start.getDate() - 28)

  const [last14, prev14] = await Promise.all([
    db.bookingInquiry.count({
      where: {
        status: CONFIRMED_STATUS,
        eventDate: { gte: last14Start, lt: todayStart },
      },
    }),
    db.bookingInquiry.count({
      where: {
        status: CONFIRMED_STATUS,
        eventDate: { gte: prev14Start, lt: last14Start },
      },
    }),
  ])
  if (prev14 <= 0) return 0
  return (last14 - prev14) / prev14
}

/**
 * Day-of-week weights from last 30 days (0=Sun, 6=Sat). Normalized so avg = 1.
 */
function getDayOfWeekWeights(byDay: Map<string, number>): number[] {
  const dowCounts = [0, 0, 0, 0, 0, 0, 0]
  for (const [dateKey, count] of byDay) {
    const d = new Date(dateKey + 'T12:00:00Z')
    const dow = d.getUTCDay()
    dowCounts[dow] += count
  }
  const total = dowCounts.reduce((a, b) => a + b, 0)
  const avg = total / 7
  if (avg <= 0) return [1, 1, 1, 1, 1, 1, 1]
  return dowCounts.map((c) => Math.round((c / avg) * 100) / 100)
}

/**
 * Project bookings for a period: baseline * (1 + trend * scale) with confidence band.
 */
function projectBookings(
  avgPerDay: number,
  days: number,
  trendPct: number,
  trendScale: number = 1
): HorizonBand {
  const trendFactor = 1 + trendPct * trendScale
  const base = Math.round(avgPerDay * days * trendFactor)
  return {
    low: Math.round(base * CONFIDENCE_LOW),
    base,
    high: Math.round(base * CONFIDENCE_HIGH),
  }
}

/**
 * Get AI demand forecast for 30 / 90 / 180 days. Lightweight baseline + trend; confidence bands.
 */
export async function getAiDemandForecast(): Promise<AiDemandForecast> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

  const [hist30, trendPct, forecastData, capacityPlan] = await Promise.all([
    getHistoricalByRegionAndDay(30),
    getTrendPct(),
    getForecastData(),
    getCapacityPlan(3 as CapacityHorizon),
  ])

  const avgBookingsPerDay30 = hist30.total / 30
  const dowWeights = getDayOfWeekWeights(hist30.byDay)
  const avgOrderValueCents = forecastData.assumptions.avgOrderValueCents || 0

  // By region: aggregate and per-region avg per day, then project
  const regions = Array.from(new Set([...hist30.byRegion.keys()].filter((r) => r)))
  if (regions.length === 0) regions.push('DEFAULT')

  const byRegion: RegionForecast[] = []
  for (const regionCode of regions) {
    const count = hist30.byRegion.get(regionCode) ?? 0
    const avgPerDay = count / 30
    const regionName = regionCode === 'DEFAULT' ? 'Default / Unset' : regionCode.replace(/_/g, ' ')
    byRegion.push({
      regionCode,
      regionName,
      period30: projectBookings(avgPerDay, 30, trendPct, 0.5),
      period90: projectBookings(avgPerDay, 90, trendPct, 1),
      period180: projectBookings(avgPerDay, 180, trendPct, 1.5),
    })
  }

  // Peak days: next 30 days with day-of-week weight applied (top 5)
  const peakDays: PeakDay[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 0; i < 30; i++) {
    const d = new Date(todayStart)
    d.setDate(d.getDate() + i)
    const dow = d.getUTCDay()
    const weight = dowWeights[dow] ?? 1
    const projected = Math.round((avgBookingsPerDay30 * weight) * 10) / 10
    peakDays.push({
      date: d.toISOString().slice(0, 10),
      projectedBookings: projected,
      dayOfWeek: dayNames[dow],
      reason: weight > 1.1 ? 'Above-average day' : undefined,
    })
  }
  peakDays.sort((a, b) => b.projectedBookings - a.projectedBookings)
  const topPeaks = peakDays.slice(0, 5)

  // Capacity shortfalls from capacity plan
  const capacityShortfalls: CapacityShortfall[] = capacityPlan.months
    .filter((m) => m.gap > 0 && m.risk === 'shortfall')
    .map((m) => ({
      monthLabel: m.monthLabel,
      gap: m.gap,
      requiredChefs: m.requiredChefs,
      hireTarget: m.hireTarget,
      risk: m.risk,
    }))

  // Revenue impact (bookings × avg order value, low/base/high)
  const proj30 = projectBookings(avgBookingsPerDay30, 30, trendPct, 0.5)
  const proj90 = projectBookings(avgBookingsPerDay30, 90, trendPct, 1)
  const proj180 = projectBookings(avgBookingsPerDay30, 180, trendPct, 1.5)
  const revenueImpact = {
    period30: {
      low: proj30.low * avgOrderValueCents,
      base: proj30.base * avgOrderValueCents,
      high: proj30.high * avgOrderValueCents,
    },
    period90: {
      low: proj90.low * avgOrderValueCents,
      base: proj90.base * avgOrderValueCents,
      high: proj90.high * avgOrderValueCents,
    },
    period180: {
      low: proj180.low * avgOrderValueCents,
      base: proj180.base * avgOrderValueCents,
      high: proj180.high * avgOrderValueCents,
    },
  }

  // Action suggestions
  const actionSuggestions: ActionSuggestion[] = []
  if (capacityShortfalls.length > 0) {
    actionSuggestions.push({
      action: 'Trigger recruitment',
      reason: `Capacity shortfall in ${capacityShortfalls.map((s) => s.monthLabel).join(', ')}; hire target ${capacityShortfalls[0]?.hireTarget ?? 0} chefs.`,
      href: '/admin/capacity',
    })
  }
  if (trendPct > 0.1) {
    actionSuggestions.push({
      action: 'Adjust surge / region pricing',
      reason: `Demand trend +${Math.round(trendPct * 100)}% (last 14d vs prior 14d). Consider surge or region pricing.`,
      href: '/admin/region-pricing',
    })
  }
  actionSuggestions.push({
    action: 'Pre-assign marketing focus',
    reason: 'Use peak days and regional forecast to focus campaigns.',
    href: '/admin/forecast/ai',
  })

  return {
    generatedAt: new Date().toISOString(),
    horizons: [
      { days: 30, label: '30 days' },
      { days: 90, label: '90 days' },
      { days: 180, label: '180 days' },
    ],
    byRegion,
    peakDays: topPeaks,
    capacityShortfalls,
    revenueImpact,
    actionSuggestions,
    inputs: {
      avgBookingsPerDay30: Math.round(avgBookingsPerDay30 * 100) / 100,
      trendPct: Math.round(trendPct * 100) / 100,
      avgOrderValueCents,
      note: 'Baseline + trend; confidence bands 85%–115%. Recalculated on load; nightly job can cache.',
    },
  }
}

/**
 * Snapshot for Ops Dashboard: 30d demand range and shortfall flag.
 */
export async function getAiDemandForecastSnapshot(): Promise<{
  period30Bookings: HorizonBand
  hasShortfall: boolean
  actionCount: number
  generatedAt: string
} | null> {
  try {
    const full = await getAiDemandForecast()
    return {
      period30Bookings: {
        low: full.byRegion.reduce((s, r) => s + r.period30.low, 0),
        base: full.byRegion.reduce((s, r) => s + r.period30.base, 0),
        high: full.byRegion.reduce((s, r) => s + r.period30.high, 0),
      },
      hasShortfall: full.capacityShortfalls.length > 0,
      actionCount: full.actionSuggestions.length,
      generatedAt: full.generatedAt,
    }
  } catch {
    return null
  }
}
