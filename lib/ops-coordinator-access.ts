/**
 * Phase 1.1 — Operations Coordinator (hospitality ops without financials).
 * Used with platform roles in admin_user_roles (see lib/admin-rbac.ts).
 */

export type AdminPlatformRole =
  | 'founder_admin'
  | 'manager'
  | 'operations_coordinator'
  | 'staff'

/** Routes that expose revenue, payments, payouts, margin, or financial reporting. */
export const FINANCIAL_ADMIN_PATH_PREFIXES = [
  '/admin/payouts',
  '/admin/costs',
  '/admin/forecast',
  '/admin/ops',
  '/admin/currency',
  '/admin/region-pricing',
  '/admin/surge-pricing',
  '/admin/margin-guardrails',
  '/admin/investors',
  '/admin/board-deck',
  '/admin/scenarios',
  '/admin/quotes',
  '/admin/payments',
  '/admin/okrs',
  '/admin/experiments',
  '/admin/capacity',
  '/admin/succession',
  '/admin/risks',
  '/admin/improvements',
  '/admin/impact',
  '/admin/housing',
  '/admin/harvest',
  '/admin/chefs/performance',
  '/admin/users',
  '/admin/system',
  '/admin/invites',
  '/admin/academy',
  '/admin/academy-products',
  '/admin/design-agent',
  '/admin/leaderboard',
] as const

export function isFinancialAdminPath(pathname: string): boolean {
  const p = pathname.split('?')[0]
  if (p.includes('/earnings') && p.startsWith('/admin/chefs/')) {
    return true
  }
  return FINANCIAL_ADMIN_PATH_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  )
}

/** Roles that can open bookings, calendar, prep, timeline, and client logistics. */
export function isHospitalityOpsPlatformRole(role: AdminPlatformRole | null): boolean {
  return (
    role === 'founder_admin' ||
    role === 'manager' ||
    role === 'operations_coordinator'
  )
}

/** Revenue, deposits, Stripe IDs, payouts, margin, and cost/forecast dashboards. */
export function canViewPlatformFinancials(role: AdminPlatformRole | null): boolean {
  return role === 'founder_admin' || role === 'manager'
}

export function platformRoleLabel(role: AdminPlatformRole | null): string {
  switch (role) {
    case 'founder_admin':
      return 'Founder Admin'
    case 'manager':
      return 'Manager'
    case 'operations_coordinator':
      return 'Operations Coordinator'
    case 'staff':
      return 'Staff'
    default:
      return 'User'
  }
}
