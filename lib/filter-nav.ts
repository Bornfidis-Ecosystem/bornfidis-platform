import { UserRole } from '@prisma/client'
import { NAV_ITEMS, type NavItem } from './nav-config'

/**
 * Phase 2A — Filter navigation by role
 * Returns only items the role is allowed to see.
 */
export function getNavForRole(role: UserRole | string | null | undefined): NavItem[] {
  if (role == null) return []
  const normalized = typeof role === 'string' ? role.toUpperCase() : role
  return NAV_ITEMS.filter((item) =>
    item.roles.some((r) => String(r) === normalized)
  )
}
