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
 * ADMIN and COORDINATOR can manage bookings
 */
export function canManageBookings(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can assign farmers to bookings
 * ADMIN and COORDINATOR can assign farmers
 */
export function canAssignFarmers(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can view admin dashboard and settings
 * Only ADMIN can access admin features
 */
export function canViewAdmin(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN'
}

/**
 * Check if user can send WhatsApp/SMS updates
 * ADMIN and COORDINATOR can send updates
 */
export function canSendUpdates(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'COORDINATOR'
}

/**
 * Check if user can manage prep checklists
 * ADMIN, COORDINATOR, and CHEF can manage prep
 */
export function canManagePrep(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'COORDINATOR' || normalizedRole === 'CHEF'
}

/**
 * Check if user can view timeline
 * ADMIN and COORDINATOR can view timeline
 */
export function canViewTimeline(role: UserRole | string | null | undefined): boolean {
  if (!role) return false
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role
  return normalizedRole === 'ADMIN' || normalizedRole === 'COORDINATOR'
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
 * Checks user_metadata, app_metadata, and falls back to Prisma User table
 */
export function getUserRole(user: any): UserRole | null {
  if (!user) return null
  
  // Check Supabase metadata first (for backward compatibility)
  const metadataRole = user.user_metadata?.role || user.app_metadata?.role
  if (metadataRole) {
    // Normalize to enum value
    const normalized = metadataRole.toUpperCase()
    if (Object.values(UserRole).includes(normalized as UserRole)) {
      return normalized as UserRole
    }
    // Legacy: 'admin' maps to ADMIN
    if (metadataRole.toLowerCase() === 'admin') {
      return UserRole.ADMIN
    }
  }
  
  return null
}
