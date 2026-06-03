import { UserRole } from '@prisma/client'

import { NAV_ITEMS, type NavItem } from './nav-config'

import type { AdminPlatformRole } from './ops-coordinator-access'

import { canViewPlatformFinancials, isFinancialAdminPath } from './ops-coordinator-access'



/**

 * Phase 2A — Filter navigation by Prisma role

 */

export function getNavForRole(role: UserRole | string | null | undefined): NavItem[] {

  if (role == null) return []

  const normalized = typeof role === 'string' ? role.toUpperCase() : role

  return NAV_ITEMS.filter((item) =>

    item.roles.some((r) => String(r) === normalized)

  )

}



/**

 * Phase 1.1 — Apply platform role: operations coordinators lose financial nav targets.

 */

export function getNavForPlatformUser(

  prismaRole: UserRole | string | null | undefined,

  platformRole: AdminPlatformRole | null,

): NavItem[] {

  let items = getNavForRole(prismaRole)

  if (canViewPlatformFinancials(platformRole)) {

    return items

  }

  return items.filter((item) => !isFinancialAdminPath(item.href))

}


