/**
 * Phase 4: Authorization Helpers
 * Role-based access control for Bornfidis platform
 * 
 * Roles are purpose-driven, not hierarchical
 * Scoped, accountable, expandable
 */

import { UserRole } from '@prisma/client'

/**
 * Check if user can manage bookings (view, update status, etc.)
 * ADMIN, STAFF, COORDINATOR can manage bookings
 */
export function canManageBookings(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can assign farmers to bookings
 * ADMIN, STAFF, COORDINATOR can assign farmers
 */
export function canAssignFarmers(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can access admin area (dashboard, bookings, etc.)
 * ADMIN, STAFF, COORDINATOR can access
 */
export function canAccessAdminArea(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can view full admin settings (e.g. user management, role assignment)
 * Only ADMIN
 */
export function canViewAdmin(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN'
}

/**
 * Check if user can send WhatsApp/SMS updates
 * ADMIN, STAFF, COORDINATOR can send updates
 */
export function canSendUpdates(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can manage prep checklists
 * ADMIN, STAFF, COORDINATOR, and CHEF can manage prep
 */
export function canManagePrep(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' || normalizedRole === 'COORDINATOR' || normalizedRole === 'CHEF'
}

/**
 * Check if user can view timeline
 * ADMIN, STAFF, COORDINATOR can view timeline
 */
export function canViewTimeline(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can assign roles to other users
 * Only ADMIN can assign roles
 */
export function canAssignRoles(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN'
}

/**
 * Get user role from Supabase Auth user object
 * Checks user_metadata, app_metadata; normalizes to Prisma UserRole
 */
export function getUserRole(user: any): UserRole | null {
  if (!user) return null

  const metadataRole = user.user_metadata?.role || user.app_metadata?.role
  if (metadataRole) {
    const normalized = String(metadataRole).toUpperCase()
    if (Object.values(UserRole).includes(normalized as UserRole)) {
      return normalized as UserRole
    }
    // Legacy: 'admin' maps to ADMIN
    if (String(metadataRole).toLowerCase() === 'admin') {
      return UserRole.ADMIN
    }
  }

  return null
}
