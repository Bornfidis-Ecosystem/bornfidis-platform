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

export type AdminPlatformRole = 'founder_admin' | 'manager' | 'staff'

/** Spec alias */
export type Role = AdminPlatformRole

function prismaAppRoleToPlatform(r: AppRole): AdminPlatformRole {
  if (r === AppRole.founder_admin) return 'founder_admin'
  if (r === AppRole.manager) return 'manager'
  return 'staff'
}

/**
 * Resolve platform role: `admin_user_roles` row (active) wins, then legacy allowlist → founder_admin,
 * then Prisma admin-area roles → founder_admin (rollout safety).
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
    // Table missing / pool timeout — fall through to ADMIN_EMAILS + Prisma role.
    console.error('[admin-rbac] admin_user_roles lookup failed:', err)
  }

  const { isAllowedAdminEmail } = await import('@/lib/auth')
  if (isAllowedAdminEmail(e)) {
    return 'founder_admin'
  }

  const pr = prismaRoleHint !== undefined ? prismaRoleHint : await getCurrentUserRole()
  if (hasRole(pr, ADMIN_AREA_ROLES)) {
    return 'founder_admin'
  }

  return null
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

/** Manager or founder (excludes staff). */
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

/** Spec name: manager or founder (not staff). */
export async function requireManagerOrAdmin(): Promise<void> {
  const r = await resolveAdminPlatformRole()
  if (!isManagerOrFounder(r)) {
    throw new Error('Access denied: Manager or founder admin required')
  }
}

/** Page guard: redirect staff away from manager-only routes. */
export async function requireManagerOrFounderPageAccess(): Promise<void> {
  let r: AdminPlatformRole | null = null
  try {
    r = await resolveAdminPlatformRole()
  } catch (err) {
    console.error('[admin-rbac] requireManagerOrFounderPageAccess failed:', err)
    redirect('/admin/login')
  }
  if (!r) {
    redirect('/admin/login')
  }
  if (r === 'staff') {
    redirect('/admin?notice=operational-only')
  }
}
