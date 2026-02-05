/**
 * Phase 2AQ — Continuous Improvement Backlog
 * Score = Impact × Urgency ÷ Effort (v1). Sort by score; ship top 3.
 */

import { db } from '@/lib/db'

export const IMPROVEMENT_SOURCES = ['Incident', 'Review', 'SLA', 'Ops', 'Suggestion'] as const
export const IMPACT_LEVELS = ['Low', 'Medium', 'High'] as const
export const EFFORT_LEVELS = ['Low', 'Medium', 'High'] as const
export const URGENCY_LEVELS = ['Low', 'Medium', 'High'] as const
export const IMPROVEMENT_STATUSES = ['Backlog', 'In Progress', 'Done', 'Blocked'] as const

export type ImprovementSource = (typeof IMPROVEMENT_SOURCES)[number]
export type ImpactLevel = (typeof IMPACT_LEVELS)[number]
export type EffortLevel = (typeof EFFORT_LEVELS)[number]
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]
export type ImprovementStatus = (typeof IMPROVEMENT_STATUSES)[number]

const LEVEL_TO_NUM: Record<string, number> = { Low: 1, Medium: 2, High: 3 }

/** Score = Impact × Urgency ÷ Effort (higher = higher priority). */
export function computePriorityScore(
  impact: string,
  urgency: string,
  effort: string
): number {
  const i = LEVEL_TO_NUM[impact] ?? 2
  const u = LEVEL_TO_NUM[urgency] ?? 2
  const e = Math.max(LEVEL_TO_NUM[effort] ?? 2, 1)
  return Math.round((i * u) / e * 100) / 100
}

export type ImprovementItemRow = {
  id: string
  source: string
  title: string
  impact: string
  effort: string
  urgency: string
  owner: string | null
  status: string
  outcomeNote: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  score: number
}

function mapRow(r: {
  id: string
  source: string
  title: string
  impact: string
  effort: string
  urgency: string
  owner: string | null
  status: string
  outcomeNote: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): ImprovementItemRow {
  return {
    ...r,
    score: computePriorityScore(r.impact, r.urgency, r.effort),
  }
}

/** Open = Backlog or In Progress. Sorted by score desc. */
export async function listOpenImprovements(): Promise<ImprovementItemRow[]> {
  const rows = await db.improvementItem.findMany({
    where: { status: { in: ['Backlog', 'In Progress'] } },
    orderBy: { createdAt: 'desc' },
  })
  const mapped = rows.map(mapRow)
  mapped.sort((a, b) => b.score - a.score)
  return mapped
}

/** Blocked items. */
export async function listBlockedImprovements(): Promise<ImprovementItemRow[]> {
  const rows = await db.improvementItem.findMany({
    where: { status: 'Blocked' },
    orderBy: { updatedAt: 'desc' },
  })
  return rows.map(mapRow)
}

/** Shipped this week = Done with completedAt in last 7 days. */
export async function listShippedThisWeek(): Promise<ImprovementItemRow[]> {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)
  const rows = await db.improvementItem.findMany({
    where: {
      status: 'Done',
      completedAt: { gte: weekStart },
    },
    orderBy: { completedAt: 'desc' },
  })
  return rows.map(mapRow)
}

/** All items (e.g. for admin list with filters). */
export async function listImprovements(opts?: {
  status?: string
  source?: string
}): Promise<ImprovementItemRow[]> {
  const rows = await db.improvementItem.findMany({
    where: {
      ...(opts?.status && { status: opts.status }),
      ...(opts?.source && { source: opts.source }),
    },
    orderBy: { createdAt: 'desc' },
  })
  const mapped = rows.map(mapRow)
  if (!opts?.status) mapped.sort((a, b) => b.score - a.score)
  return mapped
}

export async function getImprovement(id: string): Promise<ImprovementItemRow | null> {
  const row = await db.improvementItem.findUnique({ where: { id } })
  return row ? mapRow(row) : null
}

export async function createImprovement(data: {
  source: string
  title: string
  impact: string
  effort: string
  urgency?: string
  owner?: string | null
}): Promise<ImprovementItemRow> {
  const created = await db.improvementItem.create({
    data: {
      source: data.source.trim(),
      title: data.title.trim(),
      impact: data.impact,
      effort: data.effort,
      urgency: data.urgency ?? 'Medium',
      owner: data.owner?.trim() ?? null,
      status: 'Backlog',
    },
  })
  return mapRow(created)
}

export async function updateImprovement(
  id: string,
  data: {
    title?: string
    impact?: string
    effort?: string
    urgency?: string
    owner?: string | null
    status?: string
    outcomeNote?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const existing = await db.improvementItem.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'Item not found' }

  const update: Parameters<typeof db.improvementItem.update>[0]['data'] = {
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.impact !== undefined && { impact: data.impact }),
    ...(data.effort !== undefined && { effort: data.effort }),
    ...(data.urgency !== undefined && { urgency: data.urgency }),
    ...(data.owner !== undefined && { owner: data.owner?.trim() ?? null }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.outcomeNote !== undefined && { outcomeNote: data.outcomeNote?.trim() ?? null }),
  }
  if (data.status === 'Done' && existing.status !== 'Done') {
    update.completedAt = new Date()
  }
  if (data.status !== undefined && data.status !== 'Done' && existing.completedAt) {
    update.completedAt = null
  }

  await db.improvementItem.update({ where: { id }, data: update })
  return { success: true }
}
