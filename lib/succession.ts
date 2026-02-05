/**
 * Phase 2BA — Workforce Succession Planning
 * Critical roles (Lead Chef Elite, Regional Coordinator, Ops Lead) with primary + backups, readiness, training path.
 */

import { db } from '@/lib/db'
import type { SuccessionAssignmentType, SuccessionReadiness } from '@prisma/client'

export type SuccessionRoleRow = {
  id: string
  name: string
  code: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type SuccessionAssignmentRow = {
  id: string
  successionRoleId: string
  userId: string
  assignmentType: SuccessionAssignmentType
  readiness: SuccessionReadiness
  trainingPathNotes: string | null
  lastReviewAt: Date | null
  userName: string | null
  userEmail: string | null
}

export type RoleWithAssignments = SuccessionRoleRow & {
  primary: SuccessionAssignmentRow | null
  backups: SuccessionAssignmentRow[]
  lastReviewAt: Date | null
}

export type SuccessionSnapshot = {
  totalRoles: number
  rolesWithBackup: number
  rolesWithPrimary: number
  gaps: string[] // role names with no backup
  roles: RoleWithAssignments[]
}

const DEFAULT_ROLES = [
  { name: 'Lead Chef (Elite)', code: 'lead_chef_elite', sortOrder: 10 },
  { name: 'Regional Coordinator', code: 'regional_coordinator', sortOrder: 20 },
  { name: 'Ops Lead', code: 'ops_lead', sortOrder: 30 },
] as const

/**
 * Ensure default critical roles exist (idempotent).
 */
export async function ensureDefaultSuccessionRoles(): Promise<void> {
  for (const r of DEFAULT_ROLES) {
    await db.successionRole.upsert({
      where: { code: r.code },
      create: { name: r.name, code: r.code, sortOrder: r.sortOrder },
      update: { name: r.name, sortOrder: r.sortOrder },
    })
  }
}

/**
 * List all succession roles with primary and backup assignments, readiness, last review.
 */
export async function listRolesWithAssignments(): Promise<RoleWithAssignments[]> {
  const roles = await db.successionRole.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      assignments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  return roles.map((role) => {
    const primary = role.assignments.find((a) => a.assignmentType === 'PRIMARY') ?? null
    const backups = role.assignments.filter((a) => a.assignmentType === 'BACKUP')
    const lastReviewAt =
      [...role.assignments.map((a) => a.lastReviewAt)].filter(Boolean).sort((a, b) => (b!.getTime() - a!.getTime()))[0] ?? null

    return {
      id: role.id,
      name: role.name,
      code: role.code,
      sortOrder: role.sortOrder,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      primary: primary
        ? {
            id: primary.id,
            successionRoleId: primary.successionRoleId,
            userId: primary.userId,
            assignmentType: primary.assignmentType,
            readiness: primary.readiness,
            trainingPathNotes: primary.trainingPathNotes,
            lastReviewAt: primary.lastReviewAt,
            userName: primary.user.name,
            userEmail: primary.user.email,
          }
        : null,
      backups: backups.map((a) => ({
        id: a.id,
        successionRoleId: a.successionRoleId,
        userId: a.userId,
        assignmentType: a.assignmentType,
        readiness: a.readiness,
        trainingPathNotes: a.trainingPathNotes,
        lastReviewAt: a.lastReviewAt,
        userName: a.user.name,
        userEmail: a.user.email,
      })),
      lastReviewAt,
    }
  })
}

/**
 * Snapshot for Ops Dashboard: coverage and gaps.
 */
export async function getSuccessionSnapshot(): Promise<SuccessionSnapshot> {
  const roles = await listRolesWithAssignments()
  const totalRoles = roles.length
  const rolesWithPrimary = roles.filter((r) => r.primary != null).length
  const rolesWithBackup = roles.filter((r) => r.backups.length >= 1).length
  const gaps = roles.filter((r) => r.backups.length === 0).map((r) => r.name)

  return {
    totalRoles,
    rolesWithBackup,
    rolesWithPrimary,
    gaps,
    roles,
  }
}

/**
 * Create or update assignment. Use assignmentType PRIMARY (one per role) or BACKUP.
 */
export async function upsertAssignment(params: {
  successionRoleId: string
  userId: string
  assignmentType: SuccessionAssignmentType
  readiness?: SuccessionReadiness
  trainingPathNotes?: string | null
  lastReviewAt?: Date | null
}): Promise<void> {
  const { successionRoleId, userId, assignmentType, readiness, trainingPathNotes, lastReviewAt } = params
  await db.successionAssignment.upsert({
    where: {
      successionRoleId_userId: { successionRoleId, userId },
    },
    create: {
      successionRoleId,
      userId,
      assignmentType,
      readiness: readiness ?? 'DEVELOPING',
      trainingPathNotes: trainingPathNotes ?? null,
      lastReviewAt: lastReviewAt ?? null,
    },
    update: {
      assignmentType,
      ...(readiness != null && { readiness }),
      ...(trainingPathNotes !== undefined && { trainingPathNotes }),
      ...(lastReviewAt !== undefined && { lastReviewAt }),
    },
  })
}

/**
 * Update readiness and/or training path and last review for an assignment.
 */
export async function updateAssignment(
  assignmentId: string,
  updates: { readiness?: SuccessionReadiness; trainingPathNotes?: string | null; lastReviewAt?: Date | null }
): Promise<void> {
  await db.successionAssignment.update({
    where: { id: assignmentId },
    data: {
      ...(updates.readiness != null && { readiness: updates.readiness }),
      ...(updates.trainingPathNotes !== undefined && { trainingPathNotes: updates.trainingPathNotes }),
      ...(updates.lastReviewAt !== undefined && { lastReviewAt: updates.lastReviewAt }),
    },
  })
}

/**
 * Remove an assignment (primary or backup).
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  await db.successionAssignment.delete({ where: { id: assignmentId } })
}

/**
 * List users that can be assigned (e.g. staff, coordinators, elite chefs). Optional filter by role code.
 */
export async function listEligibleUsers(): Promise<{ id: string; name: string | null; email: string | null }[]> {
  const users = await db.user.findMany({
    where: {
      role: { in: ['ADMIN', 'STAFF', 'COORDINATOR', 'CHEF'] },
    },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  })
  return users
}
