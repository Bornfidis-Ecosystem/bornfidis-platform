'use server'

import { requireAuth } from '@/lib/auth'
import { listRisks, createRisk, updateRisk, deleteRisk, getRiskSnapshot } from '@/lib/risks'
import type { RiskRow, RiskSnapshot } from '@/lib/risks'
import type { RiskImpact, RiskLikelihood, RiskStatus } from '@prisma/client'

export async function listRisksAction(options?: { category?: string; status?: RiskStatus }): Promise<RiskRow[]> {
  await requireAuth()
  return listRisks(options)
}

export async function getRiskSnapshotAction(): Promise<RiskSnapshot> {
  await requireAuth()
  return getRiskSnapshot()
}

export async function createRiskAction(data: {
  category: string
  risk: string
  impact: RiskImpact
  likelihood: RiskLikelihood
  mitigation: string
  owner?: string | null
  status?: RiskStatus
}): Promise<{ success: boolean; item?: RiskRow; error?: string }> {
  try {
    await requireAuth()
    const item = await createRisk(data)
    return { success: true, item }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create' }
  }
}

export async function updateRiskAction(
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
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await updateRisk(id, data)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update' }
  }
}

export async function deleteRiskAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth()
    await deleteRisk(id)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete' }
  }
}
