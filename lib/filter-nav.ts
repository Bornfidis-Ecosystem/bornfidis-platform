import { UserRole } from '@prisma/client'

import {
  ADMIN_NAV_GROUP_LABEL,
  ADMIN_NAV_GROUP_ORDER,
  LAB_NAV_ITEMS,
  LABS_HUB_NAV_ITEM,
  NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
  isAdminLabsEnabled,
  type AdminNavGroupId,
  type NavItem,
} from './nav-config'

import type { AdminPlatformRole } from './ops-coordinator-access'
import { canViewPlatformFinancials, isFinancialAdminPath } from './ops-coordinator-access'

function roleMatches(item: NavItem, role: UserRole | string | null | undefined): boolean {
  if (role == null) return false
  const normalized = typeof role === 'string' ? role.toUpperCase() : role
  return item.roles.some((r) => String(r) === normalized)
}

function applyPlatformFinancialFilter(
  items: NavItem[],
  platformRole: AdminPlatformRole | null,
): NavItem[] {
  if (canViewPlatformFinancials(platformRole)) return items
  return items.filter((item) => !isFinancialAdminPath(item.href.split('?')[0].split('#')[0]))
}

/**
 * Phase 2A — Filter navigation by Prisma role (portals + primary admin).
 */
export function getNavForRole(role: UserRole | string | null | undefined): NavItem[] {
  if (role == null) return []
  return NAV_ITEMS.filter((item) => roleMatches(item, role))
}

/**
 * Primary Culinary OS items (+ Labs hub link when ENABLE_ADMIN_LABS).
 */
export function getPrimaryNavForRole(role: UserRole | string | null | undefined): NavItem[] {
  if (role == null) return []
  const primary = PRIMARY_NAV_ITEMS.filter((item) => roleMatches(item, role))
  if (isAdminLabsEnabled() && roleMatches(LABS_HUB_NAV_ITEM, role)) {
    return [...primary, LABS_HUB_NAV_ITEM]
  }
  return primary
}

export function getLabNavForRole(role: UserRole | string | null | undefined): NavItem[] {
  if (role == null) return []
  return LAB_NAV_ITEMS.filter((item) => roleMatches(item, role))
}

/**
 * Phase 1.1 — Apply platform role: operations coordinators lose financial nav targets.
 */
export function getNavForPlatformUser(
  prismaRole: UserRole | string | null | undefined,
  platformRole: AdminPlatformRole | null,
): NavItem[] {
  return applyPlatformFinancialFilter(getNavForRole(prismaRole), platformRole)
}

export function getPrimaryNavForPlatformUser(
  prismaRole: UserRole | string | null | undefined,
  platformRole: AdminPlatformRole | null,
): NavItem[] {
  return applyPlatformFinancialFilter(getPrimaryNavForRole(prismaRole), platformRole)
}

export function getLabNavForPlatformUser(
  prismaRole: UserRole | string | null | undefined,
  platformRole: AdminPlatformRole | null,
): NavItem[] {
  return applyPlatformFinancialFilter(getLabNavForRole(prismaRole), platformRole)
}

export type NavGroupSection = {
  id: AdminNavGroupId
  label: string
  items: NavItem[]
}

/** Group primary (or any) items that carry `group` for the Culinary OS sidebar. */
export function groupAdminNavItems(items: NavItem[]): NavGroupSection[] {
  const byGroup = new Map<AdminNavGroupId, NavItem[]>()
  for (const id of ADMIN_NAV_GROUP_ORDER) {
    byGroup.set(id, [])
  }
  for (const item of items) {
    const g = item.group
    if (!g) continue
    const list = byGroup.get(g)
    if (list) list.push(item)
  }
  return ADMIN_NAV_GROUP_ORDER.filter((id) => (byGroup.get(id)?.length ?? 0) > 0).map((id) => ({
    id,
    label: ADMIN_NAV_GROUP_LABEL[id],
    items: byGroup.get(id)!,
  }))
}
