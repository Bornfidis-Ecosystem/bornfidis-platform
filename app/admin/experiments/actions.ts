'use server'

import { requireAuth } from '@/lib/auth'
import {
  listExperiments,
  getExperiment,
  getResultsSummary,
  createExperiment,
  updateExperiment,
  startExperiment,
  stopExperiment,
  completeExperiment,
  promoteWinner,
  getGrowthExperimentsSnapshot,
  type ExperimentRow,
  type ExperimentResultsSummary,
  type GrowthExperimentsSnapshot,
} from '@/lib/experiments'

export async function getExperimentsList(): Promise<ExperimentRow[]> {
  await requireAuth()
  return listExperiments()
}

export async function getExperimentDetail(id: string): Promise<ExperimentRow | null> {
  await requireAuth()
  return getExperiment(id)
}

export async function getExperimentResults(id: string): Promise<ExperimentResultsSummary | null> {
  await requireAuth()
  return getResultsSummary(id)
}

export async function createExperimentAction(data: {
  name: string
  hypothesis?: string | null
  category?: string | null
  variantA: unknown
  variantB: unknown
  metric: string
  secondaryMetric?: string | null
  startAt: Date
  endAt: Date
  harmThreshold?: unknown
}): Promise<{ success: boolean; experiment?: ExperimentRow; error?: string }> {
  try {
    await requireAuth()
    const experiment = await createExperiment(data)
    return { success: true, experiment }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create' }
  }
}

export async function updateExperimentAction(
  id: string,
  data: Parameters<typeof updateExperiment>[1]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    const updated = await updateExperiment(id, data)
    return { success: !!updated }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update' }
  }
}

export async function startExperimentAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    const ok = await startExperiment(id)
    return { success: ok }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to start' }
  }
}

export async function stopExperimentAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    const ok = await stopExperiment(id)
    return { success: ok }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to stop' }
  }
}

export async function completeExperimentAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    const ok = await completeExperiment(id)
    return { success: ok }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to complete' }
  }
}

export async function promoteWinnerAction(
  experimentId: string,
  variant: 'A' | 'B',
  markPromoted?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    const ok = await promoteWinner(experimentId, variant, markPromoted ?? true)
    return { success: ok }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to promote' }
  }
}
