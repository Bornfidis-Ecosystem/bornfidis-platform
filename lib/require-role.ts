/**
 * Bornfidis Platform — Role-based access (Phase 1)
 * Single source of truth: Prisma User.role
 * Use server-side only (API, server actions, layout).
 */

import type { UserRole } from '@prisma/client'

/** Roles that can access admin area (ADMIN, STAFF, legacy COORDINATOR). */
export const ADMIN_AREA_ROLES: string[] = ['ADMIN', 'STAFF', 'COORDINATOR']

/** Roles that can access staff area (admin + staff). */
export const STAFF_AREA_ROLES: string[] = ['ADMIN', 'STAFF', 'COORDINATOR']

/** Roles that can access partner area (general partner tools). Phase 2F: includes FARMER, CHEF. */
export const PARTNER_AREA_ROLES: string[] = ['ADMIN', 'STAFF', 'COORDINATOR', 'PARTNER', 'FARMER', 'CHEF']

/** Roles that can access farmer area. */
export const FARMER_ROLES: string[] = ['FARMER', 'ADMIN', 'STAFF']

/** Roles that can access chef area. */
export const CHEF_ROLES: string[] = ['CHEF', 'ADMIN', 'STAFF']

/** Partner-type roles (see partner dashboard; PARTNER = coop/general, FARMER/CHEF = specialized). */
export const PARTNER_ROLES: string[] = ['PARTNER', 'FARMER', 'CHEF']

/**
 * Require that the user's role is in the allowed list.
 * Throws if not allowed. Use in server actions / API after you have the user's role.
 */
export function requireRole(
  userRole: string | null | undefined,
  allowedRoles: string[]
): asserts userRole is string {
  const normalized = userRole?.toUpperCase?.()
  if (!normalized || !allowedRoles.includes(normalized)) {
    throw new Error('Unauthorized')
  }
}

/**
 * Check if user has one of the allowed roles (non-throwing).
 */
export function hasRole(
  userRole: string | null | undefined,
  allowedRoles: string[]
): boolean {
  const normalized = userRole?.toUpperCase?.()
  return Boolean(normalized && allowedRoles.includes(normalized))
}
