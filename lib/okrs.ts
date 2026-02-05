/**
 * Phase 2AW — OKR Tracking
 * Objectives and key results; key result "current" auto-updated from ops KPIs, review analytics, revenue forecasts.
 */

import { db } from '@/lib/db'
import { getInvestorReportData } from '@/lib/investor-report'
import { getForecastData } from '@/lib/forecast'
import { getOpsDashboardData } from '@/lib/ops-dashboard'

export type OkrRow = {
  id: string
  period: string
  objective: string
  createdAt: Date
  updatedAt: Date
}

export type KeyResultRow = {
  id: string
  okrId: string
  metric: string
  target: number
  current: number
  notes: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type OkrWithKrs = OkrRow & { keyResults: KeyResultRow[] }

/** Status from current/target ratio (higher is better). */
export type KrStatus = 'on_track' | 'at_risk' | 'off_track'

export function getKrStatus(current: number, target: number): KrStatus {
  if (target <= 0) return 'on_track'
  const pct = (current / target) * 100
  if (pct >= 90) return 'on_track'
  if (pct >= 70) return 'at_risk'
  return 'off_track'
}

export function getKrProgressPct(current: number, target: number): number {
  if (target <= 0) return 100
  return Math.min(100, Math.round((current / target) * 100))
}

/** Supported metric keys for auto-update (map to live data). */
export const OKR_METRIC_KEYS = [
  'bookings_mtd',
  'bookings_qtd',
  'avg_rating',
  'margin_pct',
  'revenue_mtd_cents',
  'revenue_qtd_cents',
  'forecast_90d_cents',
  'completion_rate_pct',
  'sla_adherence_pct',
  'active_chefs',
  'review_count',
] as const

export type OkrMetricKey = (typeof OKR_METRIC_KEYS)[number]

/**
 * Get live current value for a metric (from investor report, forecast, or ops).
 * Used to auto-update KeyResult.current.
 */
export async function getLiveCurrentForMetric(metric: string): Promise<number> {
  const [investor, forecast, ops] = await Promise.all([
    getInvestorReportData(),
    getForecastData(),
    getOpsDashboardData('30d'),
  ])

  switch (metric) {
    case 'bookings_mtd':
      return investor.growth.bookingsMtd
    case 'bookings_qtd':
      return investor.growth.bookingsQtd
    case 'avg_rating':
      return investor.quality.avgRating
    case 'margin_pct':
      return investor.unitEconomics.marginPct
    case 'revenue_mtd_cents':
      return investor.revenue.mtdCents ?? 0
    case 'revenue_qtd_cents':
      return investor.revenue.qtdCents ?? 0
    case 'forecast_90d_cents':
      return forecast.period90.projectedExpectedCents
    case 'completion_rate_pct':
      return ops.kpis.completionRatePct
    case 'sla_adherence_pct':
      return investor.quality.slaAdherencePct
    case 'active_chefs':
      return investor.growth.activeChefs
    case 'review_count':
      return investor.quality.reviewCount
    default:
      return 0
  }
}

/**
 * Refresh current value for all key results under OKRs in the given period.
 * No manual entry after setup — pulls from ops/reviews/forecast.
 */
export async function refreshKeyResultsForPeriod(period: string): Promise<{ updated: number }> {
  const okrs = await db.okr.findMany({
    where: { period },
    include: { keyResults: true },
  })
  let updated = 0
  for (const okr of okrs) {
    for (const kr of okr.keyResults) {
      const live = await getLiveCurrentForMetric(kr.metric)
      if (kr.current !== live) {
        await db.keyResult.update({
          where: { id: kr.id },
          data: { current: live },
        })
        updated++
      }
    }
  }
  return { updated }
}

/**
 * List OKRs, optionally filtered by period.
 */
export async function listOKRs(period?: string | null): Promise<OkrRow[]> {
  const where = period ? { period } : {}
  const rows = await db.okr.findMany({
    where,
    orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    period: r.period,
    objective: r.objective,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

/**
 * Get OKRs for a period with key results (for admin and snapshots).
 */
export async function getOKRsForPeriod(period: string): Promise<OkrWithKrs[]> {
  const rows = await db.okr.findMany({
    where: { period },
    orderBy: { createdAt: 'asc' },
    include: {
      keyResults: { orderBy: { sortOrder: 'asc' } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    period: r.period,
    objective: r.objective,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    keyResults: r.keyResults.map((kr) => ({
      id: kr.id,
      okrId: kr.okrId,
      metric: kr.metric,
      target: kr.target,
      current: kr.current,
      notes: kr.notes,
      sortOrder: kr.sortOrder,
      createdAt: kr.createdAt,
      updatedAt: kr.updatedAt,
    })),
  }))
}

/**
 * Get single OKR with key results.
 */
export async function getOKRWithKeyResults(id: string): Promise<OkrWithKrs | null> {
  const r = await db.okr.findUnique({
    where: { id },
    include: { keyResults: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!r) return null
  return {
    id: r.id,
    period: r.period,
    objective: r.objective,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    keyResults: r.keyResults.map((kr) => ({
      id: kr.id,
      okrId: kr.okrId,
      metric: kr.metric,
      target: kr.target,
      current: kr.current,
      notes: kr.notes,
      sortOrder: kr.sortOrder,
      createdAt: kr.createdAt,
      updatedAt: kr.updatedAt,
    })),
  }
}

/**
 * Create OKR.
 */
export async function createOKR(data: { period: string; objective: string }): Promise<OkrRow> {
  const r = await db.okr.create({
    data: { period: data.period.trim(), objective: data.objective.trim() },
  })
  return {
    id: r.id,
    period: r.period,
    objective: r.objective,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Update OKR.
 */
export async function updateOKR(
  id: string,
  data: { period?: string; objective?: string }
): Promise<OkrRow | null> {
  const r = await db.okr.update({
    where: { id },
    data: {
      ...(data.period != null && { period: data.period.trim() }),
      ...(data.objective != null && { objective: data.objective.trim() }),
    },
  }).catch(() => null)
  if (!r) return null
  return {
    id: r.id,
    period: r.period,
    objective: r.objective,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Delete OKR (cascades to key results).
 */
export async function deleteOKR(id: string): Promise<boolean> {
  await db.okr.delete({ where: { id } }).catch(() => null)
  return true
}

/**
 * Create key result.
 */
export async function createKeyResult(data: {
  okrId: string
  metric: string
  target: number
  current?: number
  notes?: string | null
  sortOrder?: number
}): Promise<KeyResultRow | null> {
  const live = await getLiveCurrentForMetric(data.metric)
  const r = await db.keyResult.create({
    data: {
      okrId: data.okrId,
      metric: data.metric.trim(),
      target: data.target,
      current: data.current ?? live,
      notes: data.notes ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  }).catch(() => null)
  if (!r) return null
  return {
    id: r.id,
    okrId: r.okrId,
    metric: r.metric,
    target: r.target,
    current: r.current,
    notes: r.notes,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Update key result (notes, target, sortOrder; current can be refreshed via refreshKeyResultsForPeriod).
 */
export async function updateKeyResult(
  id: string,
  data: { metric?: string; target?: number; current?: number; notes?: string | null; sortOrder?: number }
): Promise<KeyResultRow | null> {
  const r = await db.keyResult.update({
    where: { id },
    data: {
      ...(data.metric != null && { metric: data.metric.trim() }),
      ...(data.target != null && { target: data.target }),
      ...(data.current != null && { current: data.current }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.sortOrder != null && { sortOrder: data.sortOrder }),
    },
  }).catch(() => null)
  if (!r) return null
  return {
    id: r.id,
    okrId: r.okrId,
    metric: r.metric,
    target: r.target,
    current: r.current,
    notes: r.notes,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Delete key result.
 */
export async function deleteKeyResult(id: string): Promise<boolean> {
  await db.keyResult.delete({ where: { id } }).catch(() => null)
  return true
}

/**
 * Snapshot for Ops Dashboard / Board Deck: current period OKRs with progress and status.
 */
export type OkrSnapshotItem = {
  okrId: string
  objective: string
  period: string
  keyResults: {
    id: string
    metric: string
    target: number
    current: number
    progressPct: number
    status: KrStatus
    notes: string | null
  }[]
}

export async function getOKRSnapshotForPeriod(period: string): Promise<OkrSnapshotItem[]> {
  const okrs = await getOKRsForPeriod(period)
  return okrs.map((okr) => ({
    okrId: okr.id,
    objective: okr.objective,
    period: okr.period,
    keyResults: okr.keyResults.map((kr) => ({
      id: kr.id,
      metric: kr.metric,
      target: kr.target,
      current: kr.current,
      progressPct: getKrProgressPct(kr.current, kr.target),
      status: getKrStatus(kr.current, kr.target),
      notes: kr.notes,
    })),
  }))
}
