'use server'

import { requireAuth } from '@/lib/auth'
import { setDayAvailability } from '@/lib/chef-availability'

/**
 * Phase 2V — Admin sets any chef's availability.
 */
export async function setDayAvailabilityAdmin(
  chefId: string,
  date: string,
  available: boolean,
  note?: string | null
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  const d = new Date(date + 'T12:00:00.000Z')
  return setDayAvailability(chefId, d, available, note ?? null)
}
