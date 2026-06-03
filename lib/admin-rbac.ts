/**
 * Bornfidis admin platform roles — table + legacy ADMIN_EMAILS / Prisma admin-area fallback.
 * Does not replace Prisma User.role; layers on top for ops console granularity.
 */

import { redirect } from 'next/navigation'
import { AppRole, type UserRole } from '@prisma/client'
import { createServerSupabaseClient } from '@/lib/auth'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { ADMIN_AREA_ROLES, hasRole } from '@/lib/require-role'
import { db } from '@/lib/db'
import {
  canViewPlatformFinancials,
  isFinancialAdminPath,
  isHospitalityOpsPlatformRole,
  type AdminPlatformRole,
} from '@/lib/ops-coordinator-access'

export type { AdminPlatformRole }

/** Spec alias */
export type Role = AdminPlatformRole

function prismaAppRoleToPlatform(r: AppRole): AdminPlatformRole {
  if (r === AppRole.founder_admin) return 'founder_admin'
  if (r === AppRole.manager) return 'manager'
  if (r === AppRole.operations_coordinator) return 'operations_coordinator'
  return 'staff'
}

/** Prisma admin-area role → default platform role when no admin_user_roles row exists. */
function defaultPlatformRoleForPrismaRole(pr: UserRole | null): AdminPlatformRole | null {
  if (!pr || !hasRole(pr, ADMIN_AREA_ROLES)) return null
  const normalized = String(pr).toUpperCase()
  if (normalized === 'ADMIN') return 'founder_admin'
  if (normalized === 'COORDINATOR') return 'operations_coordinator'
  if (normalized === 'STAFF') return 'manager'
  return 'manager'
}

/**
 * Resolve platform role: `admin_user_roles` row (active) wins, then legacy allowlist → founder_admin,
 * then Prisma admin-area default (COORDINATOR → operations_coordinator, not founder).
 */
export async function resolveAdminPlatformRoleForEmail(
  email: string | null | undefined,
  prismaRoleHint?: UserRole | null,
): Promise<AdminPlatformRole | null> {
  const e = email?.trim().toLowerCase() ?? ''
  if (!e) return null

  try {
    const row = await db.adminUserRole.findUnique({ where: { email: e } })
    if (row) {
      if (!row.active) return null
      return prismaAppRoleToPlatform(row.role)
    }
  } catch (err) {
    console.error('[admin-rbac] admin_user_roles lookup failed:', err)
  }

  const { isAllowedAdminEmail } = await import('@/lib/auth')
  if (isAllowedAdminEmail(e)) {
    return 'founder_admin'
  }

  const pr = prismaRoleHint !== undefined ? prismaRoleHint : await getCurrentUserRole()
  return defaultPlatformRoleForPrismaRole(pr)
}

/** Logged-in user’s platform role, or null. */
export async function resolveAdminPlatformRole(): Promise<AdminPlatformRole | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) return null
    const prismaRole = await getCurrentUserRole()
    return resolveAdminPlatformRoleForEmail(user.email, prismaRole)
  } catch (err) {
    console.error('[admin-rbac] resolveAdminPlatformRole failed:', err)
    return null
  }
}

/** Same as resolveAdminPlatformRole (explicit “with fallback” naming). */
export async function getCurrentUserRoleWithFallback(): Promise<AdminPlatformRole | null> {
  return resolveAdminPlatformRole()
}

export function hasRoleAccess(role: AdminPlatformRole | null, allowed: AdminPlatformRole[]): boolean {
  if (!role) return false
  return allowed.includes(role)
}

export function isFounderAdminRole(role: AdminPlatformRole | null): boolean {
  return role === 'founder_admin'
}

/** Manager or founder (excludes staff and operations coordinator). */
export function isManagerOrFounder(role: AdminPlatformRole | null): boolean {
  return role === 'founder_admin' || role === 'manager'
}

export async function requireRole(allowed: AdminPlatformRole[]): Promise<void> {
  const r = await resolveAdminPlatformRole()
  if (!hasRoleAccess(r, allowed)) {
    throw new Error('Access denied: insufficient platform role')
  }
}

export async function requireFounderAdmin(): Promise<void> {
  const r = await resolveAdminPlatformRole()
  if (r !== 'founder_admin') {
    throw new Error('Access denied: Founder admin only')
  }
}

/** Spec name: manager or founder (not staff / operations coordinator). */
export async function requireManagerOrAdmin(): Promise<void> {
  const r = await resolveAdminPlatformRole()
  if (!isManagerOrFounder(r)) {
    throw new Error('Access denied: Manager or founder admin required')
  }
}

/**
 * Hospitality ops pages: bookings, calendar, clients, prep, timeline, logistics.
 * Blocks legacy `staff` (dashboard-only).
 */
export async function requireHospitalityOpsPageAccess(): Promise<void> {
  let r: AdminPlatformRole | null = null
  try {
    r = await resolveAdminPlatformRole()
  } catch (err) {
    console.error('[admin-rbac] requireHospitalityOpsPageAccess failed:', err)
    redirect('/admin/login')
  }
  if (!r) {
    redirect('/admin/login')
  }
  if (!isHospitalityOpsPlatformRole(r)) {
    redirect('/admin?notice=operational-only')
  }
}

/** @deprecated Use requireHospitalityOpsPageAccess */
export const requireManagerOrFounderPageAccess = requireHospitalityOpsPageAccess

/** Block financial reporting / payment admin routes for operations coordinators. */
export async function requireFinancialPageAccess(): Promise<void> {
  await requireHospitalityOpsPageAccess()
  const r = await resolveAdminPlatformRole()
  if (!canViewPlatformFinancials(r)) {
    redirect('/admin?notice=hospitality-ops-only')
  }
}

/** Call from admin layout children wrapper or individual financial pages. */
export async function guardFinancialPath(pathname: string): Promise<void> {
  if (!isFinancialAdminPath(pathname)) return
  await requireFinancialPageAccess()
}
