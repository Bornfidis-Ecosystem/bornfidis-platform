'use server'

import { requireAuth } from '@/lib/auth'
import {
  listOKRs,
  getOKRsForPeriod,
  getOKRWithKeyResults,
  createOKR,
  updateOKR,
  deleteOKR,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
  refreshKeyResultsForPeriod,
  type OkrWithKrs,
} from '@/lib/okrs'

export async function getOKRsList(period?: string | null) {
  await requireAuth()
  return listOKRs(period)
}

export async function getOKRsByPeriod(period: string) {
  await requireAuth()
  return getOKRsForPeriod(period)
}

export async function getOKRDetail(id: string): Promise<OkrWithKrs | null> {
  await requireAuth()
  return getOKRWithKeyResults(id)
}

export async function createOKRAction(data: { period: string; objective: string }) {
  await requireAuth()
  return createOKR(data)
}

export async function updateOKRAction(id: string, data: { period?: string; objective?: string }) {
  await requireAuth()
  return updateOKR(id, data)
}

export async function deleteOKRAction(id: string) {
  await requireAuth()
  return deleteOKR(id)
}

export async function createKeyResultAction(data: {
  okrId: string
  metric: string
  target: number
  current?: number
  notes?: string | null
  sortOrder?: number
}) {
  await requireAuth()
  return createKeyResult(data)
}

export async function updateKeyResultAction(
  id: string,
  data: { metric?: string; target?: number; current?: number; notes?: string | null; sortOrder?: number }
) {
  await requireAuth()
  return updateKeyResult(id, data)
}

export async function deleteKeyResultAction(id: string) {
  await requireAuth()
  return deleteKeyResult(id)
}

export async function refreshOKRsAction(period: string): Promise<{ updated: number; error?: string }> {
  await requireAuth()
  try {
    const result = await refreshKeyResultsForPeriod(period)
    return { updated: result.updated }
  } catch (e) {
    return { updated: 0, error: e instanceof Error ? e.message : 'Refresh failed' }
  }
}
