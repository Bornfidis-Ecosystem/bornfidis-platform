'use server'

import { registerFarmer } from '@/lib/farmer-service'
import type { RegisterFarmerData } from '@/lib/farmer-service'

/**
 * Server action: submit farmer registration from FarmerIntakeForm.
 * Calls registerFarmer (Supabase farmers table).
 */
export async function submitFarmerRegistration(
  data: RegisterFarmerData
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  const result = await registerFarmer(data)
  return result as { success: boolean; data?: { id: string }; error?: string }
}
