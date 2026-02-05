/**
 * Phase 2AO — Incident Postmortems.
 * Blameless learning; action items with owner + due date; read-only after closure.
 */

import { db } from '@/lib/db'

export const INCIDENT_TYPES = [
  'missed_booking',
  'late_booking',
  'chef_no_show',
  'payment_failure',
  'client_escalation',
  'system_outage',
  'other',
] as const

export const INCIDENT_SEVERITIES = ['LOW', 'MED', 'HIGH'] as const

export type IncidentType = (typeof INCIDENT_TYPES)[number]
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number]

export type ActionItem = {
  description: string
  owner: string
  dueDate: string // ISO date
  done?: boolean
}

export type IncidentRow = {
  id: string
  type: string
  severity: string
  summary: string
  impact: string | null
  rootCause: string | null
  whatWentWell: string | null
  whatToImprove: string | null
  actions: ActionItem[] | null
  closedAt: Date | null
  bookingId: string | null
  chefId: string | null
  createdAt: Date
  updatedAt: Date
}

function mapRow(r: {
  id: string
  type: string
  severity: string
  summary: string
  impact: string | null
  rootCause: string | null
  whatWentWell: string | null
  whatToImprove: string | null
  actions: unknown
  closedAt: Date | null
  bookingId: string | null
  chefId: string | null
  createdAt: Date
  updatedAt: Date
}): IncidentRow {
  const actions = Array.isArray(r.actions) ? (r.actions as ActionItem[]) : null
  return {
    id: r.id,
    type: r.type,
    severity: r.severity,
    summary: r.summary,
    impact: r.impact,
    rootCause: r.rootCause,
    whatWentWell: r.whatWentWell,
    whatToImprove: r.whatToImprove,
    actions,
    closedAt: r.closedAt,
    bookingId: r.bookingId,
    chefId: r.chefId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export async function listIncidents(opts?: {
  bookingId?: string
  chefId?: string
  limit?: number
}): Promise<IncidentRow[]> {
  const rows = await db.incident.findMany({
    where: {
      ...(opts?.bookingId && { bookingId: opts.bookingId }),
      ...(opts?.chefId && { chefId: opts.chefId }),
    },
    orderBy: { createdAt: 'desc' },
    take: opts?.limit ?? 200,
  })
  return rows.map(mapRow)
}

export async function getIncident(id: string): Promise<IncidentRow | null> {
  const row = await db.incident.findUnique({ where: { id } })
  return row ? mapRow(row) : null
}

export async function createIncident(data: {
  type: string
  severity: string
  summary: string
  impact?: string | null
  rootCause?: string | null
  whatWentWell?: string | null
  whatToImprove?: string | null
  actions?: ActionItem[] | null
  bookingId?: string | null
  chefId?: string | null
}): Promise<IncidentRow> {
  const created = await db.incident.create({
    data: {
      type: data.type.trim(),
      severity: data.severity,
      summary: data.summary.trim(),
      impact: data.impact?.trim() ?? null,
      rootCause: data.rootCause?.trim() ?? null,
      whatWentWell: data.whatWentWell?.trim() ?? null,
      whatToImprove: data.whatToImprove?.trim() ?? null,
      actions: data.actions ?? [],
      bookingId: data.bookingId ?? null,
      chefId: data.chefId ?? null,
    },
  })
  return mapRow(created)
}

export async function updateIncident(
  id: string,
  data: {
    type?: string
    severity?: string
    summary?: string
    impact?: string | null
    rootCause?: string | null
    whatWentWell?: string | null
    whatToImprove?: string | null
    actions?: ActionItem[] | null
  }
): Promise<{ success: boolean; error?: string }> {
  const existing = await db.incident.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'Incident not found' }
  if (existing.closedAt) return { success: false, error: 'Incident is closed; read-only' }

  await db.incident.update({
    where: { id },
    data: {
      ...(data.type !== undefined && { type: data.type.trim() }),
      ...(data.severity !== undefined && { severity: data.severity }),
      ...(data.summary !== undefined && { summary: data.summary.trim() }),
      ...(data.impact !== undefined && { impact: data.impact?.trim() ?? null }),
      ...(data.rootCause !== undefined && { rootCause: data.rootCause?.trim() ?? null }),
      ...(data.whatWentWell !== undefined && { whatWentWell: data.whatWentWell?.trim() ?? null }),
      ...(data.whatToImprove !== undefined && { whatToImprove: data.whatToImprove?.trim() ?? null }),
      ...(data.actions !== undefined && { actions: data.actions }),
    },
  })
  return { success: true }
}

export async function closeIncident(id: string): Promise<{ success: boolean; error?: string }> {
  const existing = await db.incident.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'Incident not found' }
  if (existing.closedAt) return { success: true }

  await db.incident.update({
    where: { id },
    data: { closedAt: new Date() },
  })
  return { success: true }
}

/** Count by severity for trends (e.g. last 90 days). */
export async function getIncidentTrends(daysBack: number = 90): Promise<
  { severity: string; count: number }[]
> {
  const since = new Date()
  since.setDate(since.getDate() - daysBack)

  const rows = await db.incident.groupBy({
    by: ['severity'],
    where: { createdAt: { gte: since } },
    _count: { id: true },
  })
  return rows.map((r) => ({ severity: r.severity, count: r._count.id }))
}
