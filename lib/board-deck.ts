/**
 * Phase 2AU — Board Deck Automation
 * Pulls from Ops, Investor Report, Forecast, Costs, Improvements, OKRs. Read-only; locked definitions.
 */

import { getInvestorReportData } from '@/lib/investor-report'
import { getForecastData } from '@/lib/forecast'
import { getCostInsights } from '@/lib/cost-insights'
import { listOpenImprovements } from '@/lib/improvements'
import { getOKRSnapshotForPeriod } from '@/lib/okrs'
import type { OkrSnapshotItem } from '@/lib/okrs'

export type BoardDeckPeriod = 'month' | 'quarter'

export type BoardDeckData = {
  period: BoardDeckPeriod
  periodLabel: string
  generatedAt: string
  executiveSummary: {
    revenueCents: number
    bookings: number
    marginPct: number
    forecast90dCents: number
    avgRating: number
    slaAdherencePct: number
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
    slaOnTrack: number
    slaTotal: number
  }
  finance: {
    revenueMtdCents: number
    revenueQtdCents: number
    payoutMtdCents: number
    marginPct: number
    bonusPct: number
  }
  forecast: {
    period30ConfirmedCents: number
    period30ProjectedCents: number
    period90ConfirmedCents: number
    period90ProjectedCents: number
    period90LowCents: number
    period90HighCents: number
  }
  risksAndActions: {
    recommendations: string[]
    topImprovements: { title: string; source: string; score: number }[]
  }
  roadmap: {
    topItems: { title: string; owner: string | null; status: string }[]
  }
}

/**
 * Build board deck data from live sources. No new schema. Definitions locked to ops/forecast/costs.
 */
export async function getBoardDeckData(period: BoardDeckPeriod): Promise<BoardDeckData> {
  const [investor, forecast, costs, openItems] = await Promise.all([
    getInvestorReportData(),
    getForecastData(),
    getCostInsights(),
    listOpenImprovements(),
  ])

  const now = new Date()
  const periodLabel =
    period === 'quarter'
      ? `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const okrPeriodKey =
    period === 'quarter'
      ? `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`
      : periodLabel

  const okrSnapshot = await getOKRSnapshotForPeriod(okrPeriodKey).catch(() => [])

  const revenueCents = period === 'quarter' ? investor.revenue.qtdCents : investor.revenue.mtdCents
  const bookings = period === 'quarter' ? investor.growth.bookingsQtd : investor.growth.bookingsMtd

  return {
    period,
    periodLabel,
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      revenueCents,
      bookings,
      marginPct: investor.unitEconomics.marginPct,
      forecast90dCents: forecast.period90.projectedExpectedCents,
      avgRating: investor.quality.avgRating,
      slaAdherencePct: investor.quality.slaAdherencePct,
    },
    growth: investor.growth,
    quality: investor.quality,
    finance: {
      revenueMtdCents: investor.revenue.mtdCents,
      revenueQtdCents: investor.revenue.qtdCents,
      payoutMtdCents: investor.unitEconomics.payoutMtdCents,
      marginPct: investor.unitEconomics.marginPct,
      bonusPct: investor.unitEconomics.bonusPct,
    },
    forecast: {
      period30ConfirmedCents: forecast.period30.confirmedCents,
      period30ProjectedCents: forecast.period30.projectedExpectedCents,
      period90ConfirmedCents: forecast.period90.confirmedCents,
      period90ProjectedCents: forecast.period90.projectedExpectedCents,
      period90LowCents: forecast.period90.projectedLowCents,
      period90HighCents: forecast.period90.projectedHighCents,
    },
    risksAndActions: {
      recommendations: costs.recommendations,
      topImprovements: openItems.slice(0, 5).map((i) => ({ title: i.title, source: i.source, score: i.score })),
    },
    roadmap: {
      topItems: openItems.slice(0, 5).map((i) => ({ title: i.title, owner: i.owner, status: i.status })),
    },
    okrSnapshot,
  }
}
