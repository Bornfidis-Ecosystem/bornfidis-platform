'use server'

import { db } from '@/lib/db'
import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { ChefBookingStatus } from '@prisma/client'
import { notifyChefStatusChange } from '@/lib/notify'
import { checkAndAwardBadges } from '@/lib/badges'

const VALID_TRANSITIONS: Record<ChefBookingStatus, ChefBookingStatus[]> = {
  ASSIGNED: ['CONFIRMED'],
  CONFIRMED: ['IN_PREP'],
  IN_PREP: ['COMPLETED'],
  COMPLETED: [],
}

/**
 * Phase 2I — Update chef assignment status (ASSIGNED → CONFIRMED → IN_PREP → COMPLETED).
 * Chef can only update their own assignment; no skipping backward.
 * Phase 2L — Notify chef (email + WhatsApp) once per status change; fail-soft.
 */
export async function updateChefStatus(
  assignmentId: string,
  newStatus: ChefBookingStatus
): Promise<{ success: boolean; error?: string }> {
  const role = await getCurrentUserRole()
  if (!role) return { success: false, error: 'Unauthorized' }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  const assignment = await db.chefAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      chef: { include: { partnerProfile: true } },
      booking: { select: { name: true, eventDate: true } },
    },
  })
  if (!assignment) return { success: false, error: 'Assignment not found' }
  if (assignment.chefId !== user.id) return { success: false, error: 'Not your assignment' }

  const allowed = VALID_TRANSITIONS[assignment.status as ChefBookingStatus]
  if (!allowed?.includes(newStatus)) {
    return { success: false, error: `Cannot change status from ${assignment.status} to ${newStatus}` }
  }

  await db.chefAssignment.update({
    where: { id: assignmentId },
    data: { status: newStatus },
  })

  // Phase 2L: Notify chef once per status change (email + WhatsApp; fail-soft)
  await notifyChefStatusChange({
    chef: {
      email: assignment.chef.email ?? undefined,
      phone: assignment.chef.partnerProfile?.phone ?? undefined,
    },
    booking: {
      name: assignment.booking.name,
      eventDate: assignment.booking.eventDate,
    },
    status: newStatus,
  })

  // Phase 2P: Check badge criteria on job completion (On-Time Pro, Prep Perfect)
  if (newStatus === 'COMPLETED') {
    await checkAndAwardBadges(assignment.chefId).catch(() => {})
  }

  return { success: true }
}

/**
 * Phase 2I — Update chef assignment notes (chef's own assignment only).
 */
export async function updateChefAssignmentNotes(
  assignmentId: string,
  notes: string | null
): Promise<{ success: boolean; error?: string }> {
  const role = await getCurrentUserRole()
  if (!role) return { success: false, error: 'Unauthorized' }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  const assignment = await db.chefAssignment.findUnique({
    where: { id: assignmentId },
  })
  if (!assignment) return { success: false, error: 'Assignment not found' }
  if (assignment.chefId !== user.id) return { success: false, error: 'Not your assignment' }

  await db.chefAssignment.update({
    where: { id: assignmentId },
    data: { notes: notes ?? undefined },
  })
  return { success: true }
}

/** Phase 2K — completed shape: { "0": true, "1": false } by item index */
type CompletedMap = Record<string, boolean>

/**
 * Phase 2K — Update chef prep checklist progress (chef's own assignment only).
 */
export async function updatePrep(
  bookingId: string,
  completed: CompletedMap
): Promise<{ success: boolean; error?: string }> {
  const role = await getCurrentUserRole()
  if (!role) return { success: false, error: 'Unauthorized' }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  const assignment = await db.chefAssignment.findUnique({
    where: { bookingId },
  })
  if (!assignment) return { success: false, error: 'Assignment not found' }
  if (assignment.chefId !== user.id) return { success: false, error: 'Not your assignment' }

  const template = await db.prepChecklistTemplate.findFirst({ orderBy: { createdAt: 'asc' } })

  await db.chefPrepChecklist.upsert({
    where: { bookingId },
    update: { completed: completed as object },
    create: {
      bookingId,
      chefId: user.id,
      templateId: template?.id ?? undefined,
      completed: completed as object,
    },
  })
  return { success: true }
}
