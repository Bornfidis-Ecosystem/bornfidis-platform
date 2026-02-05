/**
 * Phase 2AS — Investor Reporting
 * Monthly/quarterly snapshots: revenue, growth, quality, unit economics, outlook.
 * Read-only; consistent definitions; audit-friendly. No new schema.
 */

import { db } from '@/lib/db'
import { getForecastData } from '@/lib/forecast'

function revenueCents(b: { quoteTotalCents: number | null; totalCents: number | null }): number {
  const q = b.quoteTotalCents ?? 0
  const t = b.totalCents ?? 0
  return q > 0 ? q : t > 0 ? t : 0
}

function getMonthStart(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
  return out
}

function getMonthEnd(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
  return out
}

function getQuarterStart(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) + 1
  const out = new Date(d.getFullYear(), (q - 1) * 3, 1, 0, 0, 0, 0)
  return out
}

function getQuarterEnd(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) + 1
  const out = new Date(d.getFullYear(), q * 3, 0, 23, 59, 59, 999)
  return out
}

export type InvestorReportData = {
  revenue: {
    mtdCents: number
    mtdBookings: number
    qtdCents: number
    qtdBookings: number
    yoyCents: number | null
    yoyBookings: number | null
    yoyPercent: number | null
  }
  growth: {
    bookingsMtd: number
    bookingsQtd: number
    aovCents: number
    activeChefs: number
  }
  quality: {
    avgRating: number
    reviewCount: number
    slaAdherencePct: number
    slaTotal: number
    slaOnTrack: number
  }
  unitEconomics: {
    revenueMtdCents: number
    payoutMtdCents: number
    marginPct: number
    bonusPct: number
  }
  outlook: {
    forecast90dCents: number
    forecast90dLow: number
    forecast90dHigh: number
  }
  generatedAt: string
  periodLabel: string
}

/**
 * Build investor report from ops + forecast. Definitions aligned with dashboard/forecast.
 */
export async function getInvestorReportData(): Promise<InvestorReportData> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const monthStart = getMonthStart(now)
  const monthEnd = getMonthEnd(now)
  const quarterStart = getQuarterStart(now)
  const quarterEnd = getQuarterEnd(now)

  const lastYearMonthStart = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0)
  const lastYearMonthEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0, 23, 59, 59, 999)

  const [
    bookingsMtd,
    bookingsQtd,
    bookingsYoY,
    forecast,
    reviewsMtd,
    slaBookings,
    paidMtd,
    activeChefsSet,
  ] = await Promise.all([
    db.bookingInquiry.findMany({
      where: { eventDate: { gte: monthStart, lte: monthEnd } },
      select: {
        quoteTotalCents: true,
        totalCents: true,
        chefPayoutAmountCents: true,
        chefPayoutBonusCents: true,
      },
    }),
    db.bookingInquiry.findMany({
      where: { eventDate: { gte: quarterStart, lte: quarterEnd } },
      select: { quoteTotalCents: true, totalCents: true },
    }),
    db.bookingInquiry.findMany({
      where: { eventDate: { gte: lastYearMonthStart, lte: lastYearMonthEnd } },
      select: { quoteTotalCents: true, totalCents: true },
    }),
    getForecastData(),
    db.review.findMany({
      where: { hidden: false, booking: { eventDate: { gte: monthStart, lte: monthEnd } } },
      select: { rating: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: monthStart, lte: monthEnd },
        assignedChefId: { not: null },
      },
      select: { slaStatus: true },
    }),
    db.bookingInquiry.findMany({
      where: {
        chefPayoutStatus: { equals: 'paid', mode: 'insensitive' },
        chefPayoutPaidAt: { gte: monthStart, lte: monthEnd },
      },
      select: { chefPayoutAmountCents: true, chefPayoutBonusCents: true },
    }),
    db.chefAssignment.findMany({
      where: { booking: { eventDate: { gte: monthStart, lte: monthEnd } } },
      select: { chefId: true },
    }),
  ])

  const mtdCents = bookingsMtd.reduce((s, b) => s + revenueCents(b), 0)
  const qtdCents = bookingsQtd.reduce((s, b) => s + revenueCents(b), 0)
  const yoyCents = bookingsYoY.reduce((s, b) => s + revenueCents(b), 0)
  const yoyPercent =
    yoyCents > 0 ? Math.round(((mtdCents - yoyCents) / yoyCents) * 1000) / 10 : null

  const payoutMtdCents = paidMtd.reduce((s, b) => s + (b.chefPayoutAmountCents ?? 0), 0)
  const revenueForMargin = mtdCents || 1
  const marginPct = Math.round(((revenueForMargin - payoutMtdCents) / revenueForMargin) * 1000) / 10
  const withBonus = paidMtd.filter((b) => (b.chefPayoutBonusCents ?? 0) > 0).length
  const bonusPct = paidMtd.length === 0 ? 0 : Math.round((withBonus / paidMtd.length) * 100)

  const avgRating =
    reviewsMtd.length === 0
      ? 0
      : Math.round((reviewsMtd.reduce((s, r) => s + r.rating, 0) / reviewsMtd.length) * 10) / 10

  const slaTotal = slaBookings.length
  const slaOnTrack = slaBookings.filter(
    (b) => (b.slaStatus ?? 'on_track').toLowerCase() !== 'breached'
  ).length
  const slaAdherencePct = slaTotal === 0 ? 100 : Math.round((slaOnTrack / slaTotal) * 100)

  const activeChefs = new Set(activeChefsSet.map((a) => a.chefId)).size
  const aovCents = bookingsMtd.length === 0 ? 0 : Math.round(mtdCents / bookingsMtd.length)

  const periodLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')} (MTD) / Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()} (QTD)`

  return {
    revenue: {
      mtdCents,
      mtdBookings: bookingsMtd.length,
      qtdCents,
      qtdBookings: bookingsQtd.length,
      yoyCents: yoyCents || null,
      yoyBookings: bookingsYoY.length || null,
      yoyPercent,
    },
    growth: {
      bookingsMtd: bookingsMtd.length,
      bookingsQtd: bookingsQtd.length,
      aovCents,
      activeChefs,
    },
    quality: {
      avgRating,
      reviewCount: reviewsMtd.length,
      slaAdherencePct,
      slaTotal,
      slaOnTrack,
    },
    unitEconomics: {
      revenueMtdCents: mtdCents,
      payoutMtdCents: payoutMtdCents,
      marginPct,
      bonusPct,
    },
    outlook: {
      forecast90dCents: forecast.period90.projectedExpectedCents,
      forecast90dLow: forecast.period90.projectedLowCents,
      forecast90dHigh: forecast.period90.projectedHighCents,
    },
    generatedAt: new Date().toISOString(),
    periodLabel,
  }
}
