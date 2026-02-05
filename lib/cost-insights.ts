/**
 * Phase 2AT — Cost Optimization Insights
 * Labor, idle capacity, surge, rework, travel. No new schema. Fast, audit-friendly.
 */

import { db } from '@/lib/db'

function revenueCents(b: { quoteTotalCents: number | null; totalCents: number | null }): number {
  const q = b.quoteTotalCents ?? 0
  const t = b.totalCents ?? 0
  return q > 0 ? q : t > 0 ? t : 0
}

const DAYS_BACK = 30
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export type LaborInsight = {
  avgRevenuePerBookingCents: number
  avgPayoutPerBookingCents: number
  payoutToRevenuePct: number
  bookingCount: number
  totalRevenueCents: number
  totalPayoutCents: number
}

export type IdleCapacityByDay = {
  dayOfWeek: number
  dayName: string
  availableSlots: number
  assignedSlots: number
  idlePct: number
}

export type SurgeInsight = {
  bookingsWithSurge: number
  totalSurgeCents: number
  pctOfBookingsWithSurge: number
  pctOfSurgeFromTop10PctBookings: number
  topBookingsDrivePctSurge: number
  message: string
}

export type ReworkInsight = {
  cancellationsCount: number
  cancelledRevenueCents: number
  message: string
}

export type TravelInsight = {
  totalTravelFeeCents: number
  bookingsWithTravel: number
  byRegion: { regionCode: string; travelCents: number; bookings: number }[]
  message: string
}

export type CostInsightsData = {
  labor: LaborInsight
  idleCapacity: IdleCapacityByDay[]
  surge: SurgeInsight
  rework: ReworkInsight
  travel: TravelInsight
  recommendations: string[]
  generatedAt: string
}

/**
 * Get cost optimization insights for the last 30 days. No new schema.
 */
export async function getCostInsights(): Promise<CostInsightsData> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const periodStart = new Date(todayStart)
  periodStart.setDate(periodStart.getDate() - DAYS_BACK)

  const [
    paidBookings,
    availabilityByDay,
    assignedByDay,
    allBookingsSurge,
    cancelledBookings,
    bookingsWithTravel,
  ] = await Promise.all([
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: periodStart, lte: todayStart },
        assignedChefId: { not: null },
        chefPayoutAmountCents: { not: null },
      },
      select: {
        quoteTotalCents: true,
        totalCents: true,
        chefPayoutAmountCents: true,
      },
    }),
    db.chefAvailability.groupBy({
      by: ['date'],
      where: {
        date: { gte: periodStart, lte: todayStart },
        available: true,
      },
      _count: { id: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: periodStart, lte: todayStart },
        assignedChefId: { not: null },
      },
      select: { eventDate: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: periodStart, lte: todayStart },
        surgeMultiplierSnapshot: { not: null, gt: 1 },
      },
      select: {
        quoteTotalCents: true,
        totalCents: true,
        surgeMultiplierSnapshot: true,
      },
    }),
    db.bookingInquiry.findMany({
      where: {
        status: { in: ['Cancelled', 'Canceled', 'cancelled', 'canceled'] },
        updatedAt: { gte: periodStart },
      },
      select: { quoteTotalCents: true, totalCents: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: periodStart, lte: todayStart },
        regionTravelFeeCentsSnapshot: { not: null, gt: 0 },
      },
      select: {
        regionCode: true,
        regionTravelFeeCentsSnapshot: true,
      },
    }),
  ])

  const totalRevenueCents = paidBookings.reduce((s, b) => s + revenueCents(b), 0)
  const totalPayoutCents = paidBookings.reduce((s, b) => s + (b.chefPayoutAmountCents ?? 0), 0)
  const bookingCount = paidBookings.length
  const avgRevenue = bookingCount > 0 ? Math.round(totalRevenueCents / bookingCount) : 0
  const avgPayout = bookingCount > 0 ? Math.round(totalPayoutCents / bookingCount) : 0
  const payoutToRevenuePct = totalRevenueCents > 0 ? Math.round((totalPayoutCents / totalRevenueCents) * 1000) / 10 : 0

  const labor: LaborInsight = {
    avgRevenuePerBookingCents: avgRevenue,
    avgPayoutPerBookingCents: avgPayout,
    payoutToRevenuePct,
    bookingCount,
    totalRevenueCents,
    totalPayoutCents,
  }

  const availableByDow: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  const assignedByDow: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  for (const row of availabilityByDay) {
    const d = new Date(row.date)
    const dow = d.getDay()
    availableByDow[dow] = (availableByDow[dow] ?? 0) + row._count.id
  }
  for (const b of assignedByDay) {
    const d = new Date(b.eventDate)
    const dow = d.getDay()
    assignedByDow[dow] = (assignedByDow[dow] ?? 0) + 1
  }
  const idleCapacity: IdleCapacityByDay[] = DAY_NAMES.map((name, i) => {
    const avail = availableByDow[i] ?? 0
    const assigned = assignedByDow[i] ?? 0
    const idlePct = avail > 0 ? Math.round(((avail - assigned) / avail) * 100) : 0
    return { dayOfWeek: i, dayName: name, availableSlots: avail, assignedSlots: assigned, idlePct }
  })

  const totalBookingsInPeriod = await db.bookingInquiry.count({
    where: { eventDate: { gte: periodStart, lte: todayStart } },
  })
  const surgeBookingsWithRevenue = allBookingsSurge.filter((b) => revenueCents(b) > 0 && (b.surgeMultiplierSnapshot ?? 1) > 1)
  const surgeCentsByBooking = surgeBookingsWithRevenue.map((b) => {
    const rev = revenueCents(b)
    const mult = b.surgeMultiplierSnapshot ?? 1
    return Math.round(rev * (1 - 1 / mult))
  })
  const totalSurgeCents = surgeCentsByBooking.reduce((s, c) => s + c, 0)
  const sorted = [...surgeCentsByBooking].sort((a, b) => b - a)
  const top10PctCount = Math.max(1, Math.ceil(sorted.length * 0.1))
  const top10PctSurge = sorted.slice(0, top10PctCount).reduce((s, c) => s + c, 0)
  const pctOfSurgeFromTop10 = totalSurgeCents > 0 ? Math.round((top10PctSurge / totalSurgeCents) * 100) : 0
  const pctBookingsWithSurge = totalBookingsInPeriod > 0 ? Math.round((surgeBookingsWithRevenue.length / totalBookingsInPeriod) * 100) : 0

  const surge: SurgeInsight = {
    bookingsWithSurge: surgeBookingsWithRevenue.length,
    totalSurgeCents,
    pctOfBookingsWithSurge: pctBookingsWithSurge,
    pctOfSurgeFromTop10PctBookings: pctOfSurgeFromTop10,
    topBookingsDrivePctSurge: pctOfSurgeFromTop10,
    message:
      surgeBookingsWithRevenue.length > 0 && totalSurgeCents > 0
        ? `Top 10% of surge bookings drive ${pctOfSurgeFromTop10}% of surge costs.`
        : 'No surge applied in period.',
  }

  const cancelledRevenueCents = cancelledBookings.reduce((s, b) => s + revenueCents(b), 0)
  const rework: ReworkInsight = {
    cancellationsCount: cancelledBookings.length,
    cancelledRevenueCents,
    message:
      cancelledBookings.length > 0
        ? `${cancelledBookings.length} cancellations in period${cancelledRevenueCents > 0 ? `; ~${(cancelledRevenueCents / 100).toFixed(0)} revenue impact.` : '.'}`
        : 'No cancellations in period.',
  }

  const totalTravelFeeCents = bookingsWithTravel.reduce((s, b) => s + (b.regionTravelFeeCentsSnapshot ?? 0), 0)
  const regionMap = new Map<string, { travelCents: number; bookings: number }>()
  for (const b of bookingsWithTravel) {
    const code = b.regionCode ?? 'Unknown'
    const prev = regionMap.get(code) ?? { travelCents: 0, bookings: 0 }
    prev.travelCents += b.regionTravelFeeCentsSnapshot ?? 0
    prev.bookings += 1
    regionMap.set(code, prev)
  }
  const byRegion = Array.from(regionMap.entries()).map(([regionCode, v]) => ({
    regionCode,
    travelCents: v.travelCents,
    bookings: v.bookings,
  }))

  const travel: TravelInsight = {
    totalTravelFeeCents,
    bookingsWithTravel: bookingsWithTravel.length,
    byRegion,
    message:
      totalTravelFeeCents > 0
        ? `Total travel fees: $${(totalTravelFeeCents / 100).toFixed(0)} across ${bookingsWithTravel.length} bookings.`
        : 'No travel fees in period.',
  }

  const recommendations: string[] = []
  if (payoutToRevenuePct > 60) recommendations.push('Labor cost is high; consider tier mix or pricing.')
  if (totalSurgeCents > 0 && pctOfSurgeFromTop10 > 30)
    recommendations.push('Tune surge thresholds; top bookings drive a large share of surge cost.')
  const highestIdle = idleCapacity.filter((d) => d.availableSlots > 0).sort((a, b) => b.idlePct - a.idlePct)[0]
  if (highestIdle && highestIdle.idlePct > 40)
    recommendations.push(`Idle capacity highest ${highestIdle.dayName} (${highestIdle.idlePct}%); rebalance chef availability.`)
  if (cancelledBookings.length >= 5)
    recommendations.push('Trigger coaching where rework is high; review cancellation reasons.')
  if (totalTravelFeeCents > 0 && byRegion.length > 0)
    recommendations.push('Review region pricing and travel fees for high-cost regions.')

  return {
    labor,
    idleCapacity,
    surge,
    rework,
    travel,
    recommendations,
    generatedAt: new Date().toISOString(),
  }
}
