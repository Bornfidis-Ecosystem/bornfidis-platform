'use server'

import { getFarmers, updateFarmerStatus } from '@/lib/farmer-service'
import type { GetFarmersFilters } from '@/lib/farmer-service'

/**
 * Server action: load farmers for dashboard (client can't call farmer-service directly).
 */
export async function getFarmersForDashboard(filters: GetFarmersFilters = {}) {
  return getFarmers(filters)
}

/**
 * Server action: update farmer status from dashboard.
 */
export async function updateFarmerStatusAction(
  farmerId: string,
  status: string,
  notes: string | null = null
) {
  return updateFarmerStatus(farmerId, status, notes)
}
