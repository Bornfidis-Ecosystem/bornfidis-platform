/**
 * Phase 2BC — Risk Register & Mitigation
 * Single source of truth for operational, financial, quality, capacity, tech, compliance risks.
 */

import { db } from '@/lib/db'
import type { RiskImpact, RiskLikelihood, RiskStatus } from '@prisma/client'

export const RISK_CATEGORIES = [
  'Operational',
  'Financial',
  'Quality',
  'Capacity',
  'Tech',
  'Compliance',
] as const

export type RiskCategory = (typeof RISK_CATEGORIES)[number]

export type RiskRow = {
  id: string
  category: string
  risk: string
  impact: RiskImpact
  likelihood: RiskLikelihood
  mitigation: string
  owner: string | null
  status: RiskStatus
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type RiskSnapshot = {
  total: number
  open: number
  monitoring: number
  closed: number
  byCategory: { category: string; count: number }[]
  needsReview: number  // open/monitoring with reviewedAt > 30 days ago or null
  generatedAt: string
}

/**
 * List risks, optionally by category and/or status. Default: all, ordered by category then status (open first).
 */
export async function listRisks(options?: {
  category?: string
  status?: RiskStatus
}): Promise<RiskRow[]> {
  const where: { category?: string; status?: RiskStatus } = {}
  if (options?.category) where.category = options.category
  if (options?.status) where.status = options.status

  const rows = await db.risk.findMany({
    where,
    orderBy: [{ category: 'asc' }, { status: 'asc' }, { updatedAt: 'desc' }],
  })

  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    risk: r.risk,
    impact: r.impact,
    likelihood: r.likelihood,
    mitigation: r.mitigation,
    owner: r.owner,
    status: r.status,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

/**
 * Create a risk.
 */
export async function createRisk(data: {
  category: string
  risk: string
  impact: RiskImpact
  likelihood: RiskLikelihood
  mitigation: string
  owner?: string | null
  status?: RiskStatus
}): Promise<RiskRow> {
  const r = await db.risk.create({
    data: {
      category: data.category,
      risk: data.risk,
      impact: data.impact,
      likelihood: data.likelihood,
      mitigation: data.mitigation,
      owner: data.owner ?? null,
      status: data.status ?? 'OPEN',
    },
  })
  return {
    id: r.id,
    category: r.category,
    risk: r.risk,
    impact: r.impact,
    likelihood: r.likelihood,
    mitigation: r.mitigation,
    owner: r.owner,
    status: r.status,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Update a risk.
 */
export async function updateRisk(
  id: string,
  data: {
    category?: string
    risk?: string
    impact?: RiskImpact
    likelihood?: RiskLikelihood
    mitigation?: string
    owner?: string | null
    status?: RiskStatus
    reviewedAt?: Date | null
  }
): Promise<RiskRow | null> {
  const r = await db.risk.update({
    where: { id },
    data: {
      ...(data.category != null && { category: data.category }),
      ...(data.risk != null && { risk: data.risk }),
      ...(data.impact != null && { impact: data.impact }),
      ...(data.likelihood != null && { likelihood: data.likelihood }),
      ...(data.mitigation != null && { mitigation: data.mitigation }),
      ...(data.owner !== undefined && { owner: data.owner }),
      ...(data.status != null && { status: data.status }),
      ...(data.reviewedAt !== undefined && { reviewedAt: data.reviewedAt }),
    },
  }).catch(() => null)
  if (!r) return null
  return {
    id: r.id,
    category: r.category,
    risk: r.risk,
    impact: r.impact,
    likelihood: r.likelihood,
    mitigation: r.mitigation,
    owner: r.owner,
    status: r.status,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Delete a risk.
 */
export async function deleteRisk(id: string): Promise<boolean> {
  const r = await db.risk.delete({ where: { id } }).catch(() => null)
  return !!r
}

/**
 * Snapshot for Ops Dashboard: counts by status, by category, and how many need review (open/monitoring, last review > 30d or never).
 */
export async function getRiskSnapshot(): Promise<RiskSnapshot> {
  const risks = await db.risk.findMany({
    select: { category: true, status: true, reviewedAt: true },
  })

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let needsReview = 0
  const byCategory = new Map<string, number>()
  let open = 0
  let monitoring = 0
  let closed = 0

  for (const r of risks) {
    byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1)
    if (r.status === 'OPEN') open++
    else if (r.status === 'MONITORING') monitoring++
    else closed++

    if ((r.status === 'OPEN' || r.status === 'MONITORING') && (!r.reviewedAt || r.reviewedAt < thirtyDaysAgo)) {
      needsReview++
    }
  }

  return {
    total: risks.length,
    open,
    monitoring,
    closed,
    byCategory: Array.from(byCategory.entries()).map(([category, count]) => ({ category, count })),
    needsReview,
    generatedAt: now.toISOString(),
  }
}
