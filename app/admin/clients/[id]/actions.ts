'use server'

import { db } from '@/lib/db'
import { requireAdminUser } from '@/lib/requireAdmin'

export async function updateClientProfileNotes(
  id: string,
  updates: {
    dietaryPreferences?: string
    favoriteNotes?: string
    preferredLocations?: string
    internalNotes?: string
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdminUser()

  try {
    await db.clientProfile.update({
      where: { id },
      data: {
        dietaryPreferences: updates.dietaryPreferences?.trim() || null,
        favoriteNotes: updates.favoriteNotes?.trim() || null,
        preferredLocations: updates.preferredLocations?.trim() || null,
        internalNotes: updates.internalNotes?.trim() || null,
      },
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to update client profile' }
  }
}

