'use server'

import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { UserRole } from '@prisma/client'
import { setDayAvailability as setDayAvailabilityLib } from '@/lib/chef-availability'
import { addTimeSlot as addTimeSlotLib, updateTimeSlot as updateTimeSlotLib, deleteTimeSlot as deleteTimeSlotLib } from '@/lib/chef-time-slots'
import { regenerateCalendarToken } from '@/lib/chef-calendar'

const CHEF_OR_ADMIN = [UserRole.CHEF, UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR]

function canEditChef(userId: string, role: string, chefId: string): boolean {
  if (role === UserRole.ADMIN || role === UserRole.STAFF || role === UserRole.COORDINATOR) return true
  return userId === chefId
}

/**
 * Phase 2V — Chef sets own availability. CHEF can only set for self; ADMIN/STAFF for any.
 */
export async function setDayAvailability(
  chefId: string,
  date: string,
  available: boolean,
  note?: string | null
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentPrismaUser()
  const role = await getCurrentUserRole()
  if (!user || !role) return { success: false, error: 'Unauthorized' }
  if (!CHEF_OR_ADMIN.includes(role as UserRole))
    return { success: false, error: 'Access denied' }
  if (!canEditChef(user.id, role, chefId))
    return { success: false, error: 'You can only edit your own availability' }

  const d = new Date(date + 'T12:00:00.000Z')
  return setDayAvailabilityLib(chefId, d, available, note ?? null)
}

/**
 * Phase 2Y — Add time slot (no overlap). Chef = own; Admin = any.
 */
export async function addTimeSlotAction(
  chefId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentPrismaUser()
  const role = await getCurrentUserRole()
  if (!user || !role || !canEditChef(user.id, role, chefId))
    return { success: false, error: 'Unauthorized' }
  return addTimeSlotLib(chefId, date, startTime, endTime, true)
}

/**
 * Phase 2Y — Toggle slot available. Chef = own slots only; Admin = any.
 */
export async function updateTimeSlotAction(slotId: string, available: boolean): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentPrismaUser()
  const role = await getCurrentUserRole()
  if (!user || !role) return { success: false, error: 'Unauthorized' }
  const { db } = await import('@/lib/db')
  const slot = await db.chefTimeSlot.findUnique({ where: { id: slotId }, select: { chefId: true } })
  if (!slot || !canEditChef(user.id, role, slot.chefId))
    return { success: false, error: 'Not allowed to edit this slot' }
  return updateTimeSlotLib(slotId, available)
}

/**
 * Phase 2Y — Delete time slot. Chef = own slots only; Admin = any.
 */
export async function deleteTimeSlotAction(slotId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentPrismaUser()
  const role = await getCurrentUserRole()
  if (!user || !role) return { success: false, error: 'Unauthorized' }
  const { db } = await import('@/lib/db')
  const slot = await db.chefTimeSlot.findUnique({ where: { id: slotId }, select: { chefId: true } })
  if (!slot || !canEditChef(user.id, role, slot.chefId))
    return { success: false, error: 'Not allowed to delete this slot' }
  return deleteTimeSlotLib(slotId)
}

/**
 * Phase 2AB — Regenerate calendar feed link (invalidates previous). Chef only for self.
 */
export async function regenerateCalendarTokenAction(chefId: string): Promise<{ url: string } | { error: string }> {
  const user = await getCurrentPrismaUser()
  const role = await getCurrentUserRole()
  if (!user || !role) return { error: 'Unauthorized' }
  if (!canEditChef(user.id, role, chefId)) return { error: 'You can only regenerate your own calendar link' }
  const token = await regenerateCalendarToken(chefId)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return { url: `${base}/api/chef/calendar?token=${encodeURIComponent(token)}` }
}
