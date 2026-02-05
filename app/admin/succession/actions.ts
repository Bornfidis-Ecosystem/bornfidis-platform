'use server'

import { requireAuth } from '@/lib/auth'
import {
  ensureDefaultSuccessionRoles,
  listRolesWithAssignments,
  listEligibleUsers,
  upsertAssignment,
  updateAssignment,
  deleteAssignment,
} from '@/lib/succession'
import type { RoleWithAssignments } from '@/lib/succession'
import type { SuccessionAssignmentType, SuccessionReadiness } from '@prisma/client'

export async function ensureDefaultsAction(): Promise<void> {
  await requireAuth()
  await ensureDefaultSuccessionRoles()
}

export async function getRolesWithAssignmentsAction(): Promise<RoleWithAssignments[]> {
  await requireAuth()
  return listRolesWithAssignments()
}

export async function getEligibleUsersAction(): Promise<{ id: string; name: string | null; email: string | null }[]> {
  await requireAuth()
  return listEligibleUsers()
}

export async function upsertAssignmentAction(params: {
  successionRoleId: string
  userId: string
  assignmentType: SuccessionAssignmentType
  readiness?: SuccessionReadiness
  trainingPathNotes?: string | null
  lastReviewAt?: Date | null
}): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  try {
    await upsertAssignment(params)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save' }
  }
}

export async function updateAssignmentAction(
  assignmentId: string,
  updates: { readiness?: SuccessionReadiness; trainingPathNotes?: string | null; lastReviewAt?: Date | null }
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  try {
    await updateAssignment(assignmentId, updates)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update' }
  }
}

export async function deleteAssignmentAction(assignmentId: string): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  try {
    await deleteAssignment(assignmentId)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to remove' }
  }
}
