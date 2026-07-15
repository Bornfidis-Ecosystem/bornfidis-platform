import { UserRole } from '@prisma/client'

/**
 * Phase 4 — Role-aware navigation + admin IA groups.
 * Primary ops nav is grouped; unfinished strategy/experiment modules live under Labs.
 * Server rules still enforce access.
 */
export type NavItem = {
  label: string
  href: string
  roles: UserRole[]
  /** Admin Culinary OS sidebar group (omit for portal-only links). */
  group?: AdminNavGroupId
}

export type AdminNavGroupId =
  | 'command'
  | 'sales'
  | 'delivery'
  | 'finance'
  | 'people'
  | 'system'

export const ADMIN_NAV_GROUP_ORDER: AdminNavGroupId[] = [
  'command',
  'sales',
  'delivery',
  'finance',
  'people',
  'system',
]

export const ADMIN_NAV_GROUP_LABEL: Record<AdminNavGroupId, string> = {
  command: 'Command',
  sales: 'Sales',
  delivery: 'Delivery',
  finance: 'Finance',
  people: 'People',
  system: 'System',
}

const OPS: UserRole[] = [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR]
const FINANCE_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.STAFF]
const ADMIN_ONLY: UserRole[] = [UserRole.ADMIN]
const DASHBOARD_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.STAFF,
  UserRole.USER,
  UserRole.COORDINATOR,
]

/** Portal destinations (non-admin shells). */
export const PORTAL_NAV_ITEMS: NavItem[] = [
  { label: 'Partner', href: '/partner', roles: [UserRole.PARTNER] },
  { label: 'Farmer', href: '/farmer', roles: [UserRole.FARMER] },
  { label: 'Chef', href: '/chef', roles: [UserRole.CHEF] },
]

/**
 * Production-facing Culinary OS nav (Phase 4).
 * Unfinished / experimental tools are in LAB_NAV_ITEMS, not here.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  // COMMAND
  { label: 'Dashboard', href: '/admin', roles: DASHBOARD_ROLES, group: 'command' },
  { label: 'Action Queue', href: '/admin#action-needed', roles: OPS, group: 'command' },
  { label: 'Calendar', href: '/admin/calendar', roles: OPS, group: 'command' },

  // SALES
  { label: 'Leads', href: '/admin/submissions', roles: OPS, group: 'sales' },
  { label: 'Bookings', href: '/admin/bookings', roles: OPS, group: 'sales' },
  { label: 'Digital Studio', href: '/admin/digital-studio', roles: OPS, group: 'sales' },
  { label: 'Clients', href: '/admin/clients', roles: OPS, group: 'sales' },
  { label: 'Quotes', href: '/admin/quotes', roles: OPS, group: 'sales' },

  // DELIVERY
  {
    label: 'Event Prep',
    href: '/admin/bookings?prep=incomplete',
    roles: OPS,
    group: 'delivery',
  },
  { label: 'Provisions', href: '/admin/provisions-pipeline', roles: OPS, group: 'delivery' },
  { label: 'Follow-Up', href: '/admin/incidents', roles: OPS, group: 'delivery' },
  { label: 'Testimonials', href: '/admin/testimonials', roles: OPS, group: 'delivery' },

  // FINANCE
  { label: 'Payments', href: '/admin/payments', roles: FINANCE_ROLES, group: 'finance' },
  { label: 'Revenue', href: '/admin/ops', roles: FINANCE_ROLES, group: 'finance' },
  { label: 'Payouts', href: '/admin/payouts', roles: OPS, group: 'finance' },
  { label: 'Costs', href: '/admin/costs', roles: FINANCE_ROLES, group: 'finance' },

  // PEOPLE
  { label: 'Chefs', href: '/admin/chefs', roles: OPS, group: 'people' },
  { label: 'Farmers', href: '/admin/farmers', roles: OPS, group: 'people' },
  { label: 'Partners', href: '/admin/cooperative', roles: OPS, group: 'people' },
  { label: 'Invites', href: '/admin/invites', roles: FINANCE_ROLES, group: 'people' },

  // SYSTEM
  { label: 'Email Log', href: '/admin/email-log', roles: FINANCE_ROLES, group: 'system' },
  { label: 'Settings', href: '/admin/system', roles: ADMIN_ONLY, group: 'system' },
  { label: 'Users & Roles', href: '/admin/users', roles: ADMIN_ONLY, group: 'system' },
]

/**
 * Experimental / unfinished admin modules. Shown only via /admin/labs when ENABLE_ADMIN_LABS=true.
 */
export const LAB_NAV_ITEMS: NavItem[] = [
  { label: 'Academy', href: '/admin/academy', roles: OPS },
  { label: 'Academy products', href: '/admin/academy-products', roles: OPS },
  { label: 'Design Agent', href: '/admin/design-agent', roles: OPS },
  { label: 'Schedule', href: '/admin/schedule', roles: OPS },
  { label: 'Education', href: '/admin/education', roles: OPS },
  { label: 'Chef performance', href: '/admin/chefs/performance', roles: OPS },
  { label: 'Review analytics', href: '/admin/reviews/analytics', roles: OPS },
  { label: 'Coaching', href: '/admin/coaching', roles: OPS },
  { label: 'Leaderboard', href: '/admin/leaderboard', roles: OPS },
  { label: 'Currency', href: '/admin/currency', roles: FINANCE_ROLES },
  { label: 'Region pricing', href: '/admin/region-pricing', roles: FINANCE_ROLES },
  { label: 'Surge pricing', href: '/admin/surge-pricing', roles: FINANCE_ROLES },
  { label: 'Margin guardrails', href: '/admin/margin-guardrails', roles: FINANCE_ROLES },
  { label: 'Forecast', href: '/admin/forecast', roles: FINANCE_ROLES },
  { label: 'AI Demand', href: '/admin/forecast/ai', roles: FINANCE_ROLES },
  { label: 'Scenarios', href: '/admin/scenarios', roles: FINANCE_ROLES },
  { label: 'Improvements', href: '/admin/improvements', roles: FINANCE_ROLES },
  { label: 'Investors', href: '/admin/investors', roles: ADMIN_ONLY },
  { label: 'OKRs', href: '/admin/okrs', roles: FINANCE_ROLES },
  { label: 'Experiments', href: '/admin/experiments', roles: FINANCE_ROLES },
  { label: 'Capacity', href: '/admin/capacity', roles: FINANCE_ROLES },
  { label: 'Succession', href: '/admin/succession', roles: FINANCE_ROLES },
  { label: 'Risks', href: '/admin/risks', roles: FINANCE_ROLES },
  { label: 'Board deck', href: '/admin/board-deck', roles: ADMIN_ONLY },
  { label: 'Quote Builder (preview)', href: '/admin/quotes/builder', roles: OPS },
]

/** Labs hub entry — injected into System when feature flag is on. */
export const LABS_HUB_NAV_ITEM: NavItem = {
  label: 'Labs',
  href: '/admin/labs',
  roles: OPS,
  group: 'system',
}

/**
 * Flat allowlist for role filtering / AppNav (primary + portals only — not labs).
 * Use LAB_NAV_ITEMS separately for the labs hub.
 */
export const NAV_ITEMS: NavItem[] = [...PORTAL_NAV_ITEMS, ...PRIMARY_NAV_ITEMS]

export function isAdminLabsEnabled(): boolean {
  const v = process.env.ENABLE_ADMIN_LABS?.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}
