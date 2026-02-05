/**
 * Phase 2AX — Experimentation Framework
 * 50/50 split, deterministic by entity id, record outcomes, results summary (winner/loser).
 */

import { db } from '@/lib/db'
import { ExperimentStatus } from '@prisma/client'

export type ExperimentRow = {
  id: string
  name: string
  hypothesis: string | null
  category: string | null
  variantA: unknown
  variantB: unknown
  metric: string
  secondaryMetric: string | null
  startAt: Date
  endAt: Date
  status: ExperimentStatus
  harmThreshold: unknown
  winnerVariant: string | null
  promotedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ExperimentResultsSummary = {
  experimentId: string
  variantA: { count: number; assignmentCount: number; primaryMean: number; secondaryMean: number | null }
  variantB: { count: number; assignmentCount: number; primaryMean: number; secondaryMean: number | null }
  winner: 'A' | 'B' | 'tie'
  primaryMetric: string
  secondaryMetric: string | null
}

/** Deterministic 50/50: same entity + experiment always gets same variant. */
function hashToVariant(experimentId: string, entityId: string): 'A' | 'B' {
  const s = `${experimentId}:${entityId}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) % 2 === 0 ? 'A' : 'B'
}

/**
 * Get variant for entity (assign if not yet assigned). Deterministic 50/50.
 */
export async function getVariantForEntity(
  experimentId: string,
  entityId: string
): Promise<'A' | 'B'> {
  const existing = await db.experimentAssignment.findUnique({
    where: {
      experimentId_entityId: { experimentId, entityId },
    },
  })
  if (existing) return existing.variant as 'A' | 'B'

  const variant = hashToVariant(experimentId, entityId)
  await db.experimentAssignment.upsert({
    where: {
      experimentId_entityId: { experimentId, entityId },
    },
    create: { experimentId, entityId, variant },
    update: { variant },
  })
  return variant
}

/**
 * Get config for entity: returns variantA or variantB from experiment.
 */
export async function getExperimentVariantConfig(
  experimentId: string,
  entityId: string
): Promise<{ variant: 'A' | 'B'; config: unknown }> {
  const exp = await db.experiment.findUnique({
    where: { id: experimentId },
    select: { variantA: true, variantB: true },
  })
  if (!exp) return { variant: 'A', config: null }

  const variant = await getVariantForEntity(experimentId, entityId)
  const config = variant === 'A' ? exp.variantA : exp.variantB
  return { variant, config }
}

/**
 * One-stop for product code: get active experiment for category and return assigned variant config for entity.
 * Use in pricing (entityId = bookingId), messaging (userId or bookingId), ops (bookingId), incentives (bookingId).
 * Returns null if no RUNNING experiment for that category.
 */
export async function getActiveExperimentConfigForEntity(
  category: string,
  entityId: string
): Promise<{ experimentId: string; variant: 'A' | 'B'; config: unknown } | null> {
  const exp = await getActiveExperimentForCategory(category)
  if (!exp) return null
  const { variant, config } = await getExperimentVariantConfig(exp.id, entityId)
  return { experimentId: exp.id, variant, config }
}

/**
 * Record an outcome (primary or secondary metric) for an entity.
 */
export async function recordOutcome(
  experimentId: string,
  entityId: string,
  variant: 'A' | 'B',
  metric: string,
  value: number
): Promise<void> {
  await db.experimentOutcome.create({
    data: { experimentId, entityId, variant, metric, value },
  })
}

/**
 * Get active experiments (RUNNING, within start/end). Optionally filter by category.
 * Only one RUNNING per category recommended (no overlap).
 */
export async function getActiveExperiments(category?: string | null): Promise<ExperimentRow[]> {
  const now = new Date()
  const where: any = {
    status: ExperimentStatus.RUNNING,
    startAt: { lte: now },
    endAt: { gte: now },
  }
  if (category?.trim()) where.category = category.trim()
  const rows = await db.experiment.findMany({
    where,
    orderBy: { startAt: 'desc' },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    variantA: r.variantA,
    variantB: r.variantB,
    metric: r.metric,
    secondaryMetric: r.secondaryMetric,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    harmThreshold: r.harmThreshold,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

/**
 * Get the single active experiment for a category (for no-overlap).
 */
export async function getActiveExperimentForCategory(
  category: string
): Promise<ExperimentRow | null> {
  const list = await getActiveExperiments(category.trim())
  return list[0] ?? null
}

/**
 * Results summary: aggregate outcomes by variant, pick winner by primary metric (higher is better).
 */
export async function getResultsSummary(
  experimentId: string
): Promise<ExperimentResultsSummary | null> {
  const exp = await db.experiment.findUnique({
    where: { id: experimentId },
    select: { metric: true, secondaryMetric: true, variantA: true, variantB: true },
  })
  if (!exp) return null

  const [outcomes, assignments] = await Promise.all([
    db.experimentOutcome.findMany({ where: { experimentId } }),
    db.experimentAssignment.findMany({ where: { experimentId }, select: { variant: true } }),
  ])

  const primary = exp.metric
  const secondary = exp.secondaryMetric

  const aAssignments = assignments.filter((a) => a.variant === 'A').length
  const bAssignments = assignments.filter((a) => a.variant === 'B').length

  const aOutcomes = outcomes.filter((o) => o.variant === 'A')
  const bOutcomes = outcomes.filter((o) => o.variant === 'B')
  const aPrimary = aOutcomes.filter((o) => o.metric === primary)
  const bPrimary = bOutcomes.filter((o) => o.metric === primary)
  const aSecondary = secondary ? aOutcomes.filter((o) => o.metric === secondary) : []
  const bSecondary = secondary ? bOutcomes.filter((o) => o.metric === secondary) : []

  const aPrimaryMean =
    aPrimary.length === 0 ? 0 : aPrimary.reduce((s, o) => s + o.value, 0) / aPrimary.length
  const bPrimaryMean =
    bPrimary.length === 0 ? 0 : bPrimary.reduce((s, o) => s + o.value, 0) / bPrimary.length
  const aSecondaryMean =
    aSecondary.length === 0
      ? null
      : aSecondary.reduce((s, o) => s + o.value, 0) / aSecondary.length
  const bSecondaryMean =
    bSecondary.length === 0
      ? null
      : bSecondary.reduce((s, o) => s + o.value, 0) / bSecondary.length

  let winner: 'A' | 'B' | 'tie' = 'tie'
  if (aPrimary.length > 0 && bPrimary.length > 0) {
    if (aPrimaryMean > bPrimaryMean) winner = 'A'
    else if (bPrimaryMean > aPrimaryMean) winner = 'B'
  }

  return {
    experimentId,
    variantA: {
      count: aPrimary.length,
      assignmentCount: aAssignments,
      primaryMean: aPrimaryMean,
      secondaryMean: aSecondaryMean,
    },
    variantB: {
      count: bPrimary.length,
      assignmentCount: bAssignments,
      primaryMean: bPrimaryMean,
      secondaryMean: bSecondaryMean,
    },
    winner,
    primaryMetric: primary,
    secondaryMetric: secondary,
  }
}

/**
 * List all experiments (for admin).
 */
export async function listExperiments(): Promise<ExperimentRow[]> {
  const rows = await db.experiment.findMany({
    orderBy: [{ status: 'asc' }, { startAt: 'desc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    hypothesis: r.hypothesis,
    category: r.category,
    variantA: r.variantA,
    variantB: r.variantB,
    metric: r.metric,
    secondaryMetric: r.secondaryMetric,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    harmThreshold: r.harmThreshold,
    winnerVariant: r.winnerVariant,
    promotedAt: r.promotedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

/**
 * Get one experiment by id.
 */
export async function getExperiment(id: string): Promise<ExperimentRow | null> {
  const r = await db.experiment.findUnique({ where: { id } })
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    hypothesis: r.hypothesis,
    category: r.category,
    variantA: r.variantA,
    variantB: r.variantB,
    metric: r.metric,
    secondaryMetric: r.secondaryMetric,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    harmThreshold: r.harmThreshold,
    winnerVariant: r.winnerVariant,
    promotedAt: r.promotedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Create experiment (status STOPPED by default).
 */
export async function createExperiment(data: {
  name: string
  category?: string | null
  variantA: unknown
  variantB: unknown
  metric: string
  secondaryMetric?: string | null
  startAt: Date
  endAt: Date
  harmThreshold?: unknown
}): Promise<ExperimentRow> {
  const r = await db.experiment.create({
    data: {
      name: data.name.trim(),
      category: data.category?.trim() ?? null,
      variantA: data.variantA as any,
      variantB: data.variantB as any,
      metric: data.metric.trim(),
      secondaryMetric: data.secondaryMetric?.trim() ?? null,
      startAt: data.startAt,
      endAt: data.endAt,
      status: ExperimentStatus.STOPPED,
      harmThreshold: data.harmThreshold as any ?? null,
    },
  })
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    variantA: r.variantA,
    variantB: r.variantB,
    metric: r.metric,
    secondaryMetric: r.secondaryMetric,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    harmThreshold: r.harmThreshold,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Update experiment (only when STOPPED).
 */
export async function updateExperiment(
  id: string,
  data: Partial<{
    name: string
    hypothesis: string | null
    category: string | null
    variantA: unknown
    variantB: unknown
    metric: string
    secondaryMetric: string | null
    startAt: Date
    endAt: Date
    harmThreshold: unknown
    winnerVariant: string | null
    promotedAt: Date | null
  }>
): Promise<ExperimentRow | null> {
  const r = await db.experiment.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name.trim() }),
      ...(data.hypothesis !== undefined && { hypothesis: data.hypothesis?.trim() ?? null }),
      ...(data.category !== undefined && { category: data.category?.trim() ?? null }),
      ...(data.variantA != null && { variantA: data.variantA as any }),
      ...(data.variantB != null && { variantB: data.variantB as any }),
      ...(data.metric != null && { metric: data.metric.trim() }),
      ...(data.secondaryMetric !== undefined && { secondaryMetric: data.secondaryMetric?.trim() ?? null }),
      ...(data.startAt != null && { startAt: data.startAt }),
      ...(data.endAt != null && { endAt: data.endAt }),
      ...(data.harmThreshold !== undefined && { harmThreshold: data.harmThreshold as any }),
      ...(data.winnerVariant !== undefined && { winnerVariant: data.winnerVariant }),
      ...(data.promotedAt !== undefined && { promotedAt: data.promotedAt }),
    },
  }).catch(() => null)
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    hypothesis: r.hypothesis,
    category: r.category,
    variantA: r.variantA,
    variantB: r.variantB,
    metric: r.metric,
    secondaryMetric: r.secondaryMetric,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    harmThreshold: r.harmThreshold,
    winnerVariant: r.winnerVariant,
    promotedAt: r.promotedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Start experiment (set status RUNNING). Only one RUNNING per category if category set.
 */
export async function startExperiment(id: string): Promise<boolean> {
  const exp = await db.experiment.findUnique({
    where: { id },
    select: { category: true, status: true },
  })
  if (!exp || exp.status === ExperimentStatus.RUNNING) return false
  if (exp.category) {
    await db.experiment.updateMany({
      where: { category: exp.category, status: ExperimentStatus.RUNNING },
      data: { status: ExperimentStatus.STOPPED },
    })
  }
  await db.experiment.update({
    where: { id },
    data: { status: ExperimentStatus.RUNNING },
  })
  return true
}

/**
 * Stop experiment (set status STOPPED).
 */
export async function stopExperiment(id: string): Promise<boolean> {
  const r = await db.experiment.update({
    where: { id },
    data: { status: ExperimentStatus.STOPPED },
  }).catch(() => null)
  return !!r
}

/**
 * Mark experiment COMPLETE (e.g. after end date or manual).
 */
export async function completeExperiment(id: string): Promise<boolean> {
  const r = await db.experiment.update({
    where: { id },
    data: { status: ExperimentStatus.COMPLETE },
  }).catch(() => null)
  return !!r
}

/**
 * Phase 2BD: Declare winner and optionally mark as promoted.
 */
export async function promoteWinner(
  experimentId: string,
  variant: 'A' | 'B',
  markPromoted: boolean = true
): Promise<boolean> {
  const r = await db.experiment.update({
    where: { id: experimentId },
    data: {
      winnerVariant: variant,
      promotedAt: markPromoted ? new Date() : null,
    },
  }).catch(() => null)
  return !!r
}

/**
 * Phase 2BD: Check harm threshold and auto-stop if breached. Call nightly.
 * harmThreshold: { metric: string, minValue: number } — stop if primary metric mean drops below minValue.
 */
export async function checkHarmAndAutoStop(experimentId: string): Promise<{ stopped: boolean; reason?: string }> {
  const exp = await db.experiment.findUnique({
    where: { id: experimentId },
    select: { status: true, metric: true, harmThreshold: true },
  })
  if (!exp || exp.status !== ExperimentStatus.RUNNING) return { stopped: false }
  const threshold = exp.harmThreshold as { metric?: string; minValue?: number } | null
  if (!threshold?.metric || threshold.minValue == null) return { stopped: false }

  const summary = await getResultsSummary(experimentId)
  if (!summary) return { stopped: false }
  const metric = threshold.metric === exp.metric ? exp.metric : threshold.metric
  const aVal = metric === exp.metric ? summary.variantA.primaryMean : summary.variantA.secondaryMean ?? 0
  const bVal = metric === exp.metric ? summary.variantB.primaryMean : summary.variantB.secondaryMean ?? 0
  const worst = Math.min(aVal, bVal)
  if (worst < threshold.minValue) {
    await stopExperiment(experimentId)
    return { stopped: true, reason: `${metric} below ${threshold.minValue}` }
  }
  return { stopped: false }
}

/**
 * Phase 2BD: Snapshot for Ops Dashboard — running count, completed with winner, last updated.
 */
export type GrowthExperimentsSnapshot = {
  runningCount: number
  completedWithWinner: number
  total: number
  generatedAt: string
}

export async function getGrowthExperimentsSnapshot(): Promise<GrowthExperimentsSnapshot> {
  const rows = await db.experiment.findMany({
    select: { status: true, winnerVariant: true },
  })
  const runningCount = rows.filter((r) => r.status === 'RUNNING').length
  const completedWithWinner = rows.filter((r) => r.status === 'COMPLETE' && r.winnerVariant).length
  return {
    runningCount,
    completedWithWinner,
    total: rows.length,
    generatedAt: new Date().toISOString(),
  }
}

export const EXPERIMENT_CATEGORIES = ['pricing', 'messaging', 'ops', 'incentives', 'booking_flow'] as const
/** Phase 2BD: conversion_rate, revenue_per_booking, margin, sla_quality + legacy */
export const PRIMARY_METRICS = ['conversion', 'conversion_rate', 'revenue_per_booking', 'margin', 'margin_pct', 'SLA', 'sla_quality'] as const
export const SECONDARY_METRICS = ['complaints', 'cancellations'] as const
