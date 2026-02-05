'use server'

import { requireAuth } from '@/lib/auth'
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  closeIncident,
  getIncidentTrends,
} from '@/lib/incidents'
import type { ActionItem } from '@/lib/incidents'

export async function listIncidentsAction(opts?: {
  bookingId?: string
  chefId?: string
  limit?: number
}) {
  await requireAuth()
  return listIncidents(opts)
}

export async function getIncidentAction(id: string) {
  await requireAuth()
  return getIncident(id)
}

export async function createIncidentAction(data: {
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
}): Promise<{ success: boolean; incident?: Awaited<ReturnType<typeof createIncident>>; error?: string }> {
  try {
    await requireAuth()
    const incident = await createIncident(data)
    return { success: true, incident }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create incident' }
  }
}

export async function updateIncidentAction(
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
  try {
    await requireAuth()
    return await updateIncident(id, data)
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update' }
  }
}

export async function closeIncidentAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    return await closeIncident(id)
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to close' }
  }
}

export async function getIncidentTrendsAction(daysBack?: number) {
  await requireAuth()
  return getIncidentTrends(daysBack ?? 90)
}
