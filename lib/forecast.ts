/**
 * Phase 2AP — Revenue Forecasting
 * Confirmed = sum of confirmed bookings in period.
 * Projected = avg_daily_bookings × avg_order_value × days × capacity_factor (low/expected/high).
 * No new schema. Projections are estimates, not guarantees.
 */

import { db } from '@/lib/db'

const CONFIRMED_STATUS = 'Confirmed'

function revenueCents(booking: { quoteTotalCents: number | null; totalCents: number | null }): number {
  const q = booking.quoteTotalCents ?? 0
  const t = booking.totalCents ?? 0
  if (q > 0) return q
  if (t > 0) return t
  return 0
}

export type ForecastPeriod = {
  confirmedCents: number
  confirmedCount: number
  projectedLowCents: number
  projectedExpectedCents: number
  projectedHighCents: number
}

export type ForecastData = {
  period30: ForecastPeriod
  period90: ForecastPeriod
  assumptions: {
    avgBookingsPerDay30: number
    avgBookingsPerDay90: number
    avgOrderValueCents: number
    capacityFactor: number
    seasonalityNote: string
  }
  generatedAt: string // ISO
}

/**
 * Get revenue forecast for next 30 and 90 days.
 * Confirmed = bookings with status Confirmed and event_date in window.
 * Projected = trend-based (avg bookings/day × avg order value × days × capacity factor) with low/expected/high range.
 */
export async function getForecastData(): Promise<ForecastData> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const day30 = new Date(todayStart)
  day30.setDate(day30.getDate() + 30)
  const day90 = new Date(todayStart)
  day90.setDate(day90.getDate() + 90)

  // Confirmed bookings in next 30d and 90d (event_date in range, status Confirmed)
  const confirmed30 = await db.bookingInquiry.findMany({
    where: {
      status: CONFIRMED_STATUS,
      eventDate: { gte: todayStart, lt: day30 },
    },
    select: { quoteTotalCents: true, totalCents: true },
  })
  const confirmed90 = await db.bookingInquiry.findMany({
    where: {
      status: CONFIRMED_STATUS,
      eventDate: { gte: todayStart, lt: day90 },
    },
    select: { quoteTotalCents: true, totalCents: true },
  })

  const confirmed30Cents = confirmed30.reduce((s, b) => s + revenueCents(b), 0)
  const confirmed90Cents = confirmed90.reduce((s, b) => s + revenueCents(b), 0)

  // Historical: last 30d and 90d (by event_date) for avg bookings/day and avg order value
  const hist30Start = new Date(todayStart)
  hist30Start.setDate(hist30Start.getDate() - 30)
  const hist90Start = new Date(todayStart)
  hist90Start.setDate(hist90Start.getDate() - 90)

  const [bookingsLast30, bookingsLast90] = await Promise.all([
    db.bookingInquiry.findMany({
      where: { eventDate: { gte: hist30Start, lt: todayStart } },
      select: { quoteTotalCents: true, totalCents: true },
    }),
    db.bookingInquiry.findMany({
      where: { eventDate: { gte: hist90Start, lt: todayStart } },
      select: { quoteTotalCents: true, totalCents: true },
    }),
  ])

  const avgBookingsPerDay30 = bookingsLast30.length / 30
  const avgBookingsPerDay90 = bookingsLast90.length / Math.max(90, 1)
  const totalRevenue30 = bookingsLast30.reduce((s, b) => s + revenueCents(b), 0)
  const totalRevenue90 = bookingsLast90.reduce((s, b) => s + revenueCents(b), 0)
  const avgOrderValueCents =
    bookingsLast30.length > 0
      ? Math.round(totalRevenue30 / bookingsLast30.length)
      : bookingsLast90.length > 0
        ? Math.round(totalRevenue90 / bookingsLast90.length)
        : 0

  // Capacity factor: available chefs vs baseline (optional). Use 1.0 if no capacity data.
  const availableToday = await db.chefAvailability.count({
    where: { date: todayStart, available: true },
  })
  const totalSlots = await db.chefAvailability.count({
    where: { date: todayStart },
  })
  const capacityFactor = totalSlots > 0 ? Math.min(1.5, availableToday / Math.max(totalSlots, 1)) : 1.0

  // Projected revenue = avg_daily × avg_order × days × capacity_factor
  // Range: low 0.85, expected 1.0, high 1.15 (no seasonality in v1)
  const projected30Base = avgBookingsPerDay30 * avgOrderValueCents * 30 * capacityFactor
  const projected90Base = avgBookingsPerDay90 * avgOrderValueCents * 90 * capacityFactor

  const period30: ForecastPeriod = {
    confirmedCents: confirmed30Cents,
    confirmedCount: confirmed30.length,
    projectedLowCents: Math.round(projected30Base * 0.85),
    projectedExpectedCents: Math.round(projected30Base),
    projectedHighCents: Math.round(projected30Base * 1.15),
  }
  const period90: ForecastPeriod = {
    confirmedCents: confirmed90Cents,
    confirmedCount: confirmed90.length,
    projectedLowCents: Math.round(projected90Base * 0.85),
    projectedExpectedCents: Math.round(projected90Base),
    projectedHighCents: Math.round(projected90Base * 1.15),
  }

  return {
    period30,
    period90,
    assumptions: {
      avgBookingsPerDay30: Math.round(avgBookingsPerDay30 * 100) / 100,
      avgBookingsPerDay90: Math.round(avgBookingsPerDay90 * 100) / 100,
      avgOrderValueCents,
      capacityFactor: Math.round(capacityFactor * 100) / 100,
      seasonalityNote: 'Seasonality factor not applied in v1.',
    },
    generatedAt: new Date().toISOString(),
  }
}
