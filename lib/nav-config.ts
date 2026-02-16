import { UserRole } from '@prisma/client'

/**
 * Phase 2A — Role-Aware Navigation
 * Single source of truth for platform nav. Server rules still enforce access.
 */
export type NavItem = {
  label: string
  href: string
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Partner',
    href: '/partner',
    roles: [UserRole.PARTNER],
  },
  {
    label: 'Farmer',
    href: '/farmer',
    roles: [UserRole.FARMER],
  },
  {
    label: 'Chef',
    href: '/chef',
    roles: [UserRole.CHEF],
  },
  {
    label: 'Dashboard',
    href: '/admin',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.USER, UserRole.COORDINATOR],
  },
  {
    label: 'Bookings',
    href: '/admin/bookings',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Academy',
    href: '/admin/academy',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Schedule',
    href: '/admin/schedule',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Farmers',
    href: '/admin/farmers',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Chefs',
    href: '/admin/chefs',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Education',
    href: '/admin/education',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Chef performance',
    href: '/admin/chefs/performance',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Review analytics',
    href: '/admin/reviews/analytics',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Coaching',
    href: '/admin/coaching',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Leaderboard',
    href: '/admin/leaderboard',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Partners',
    href: '/admin/cooperative',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Invites',
    href: '/admin/invites',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Payouts',
    href: '/admin/payouts',
    roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.COORDINATOR],
  },
  {
    label: 'Currency',
    href: '/admin/currency',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Region pricing',
    href: '/admin/region-pricing',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Surge pricing',
    href: '/admin/surge-pricing',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Margin guardrails',
    href: '/admin/margin-guardrails',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Ops',
    href: '/admin/ops',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Forecast',
    href: '/admin/forecast',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'AI Demand',
    href: '/admin/forecast/ai',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Scenarios',
    href: '/admin/scenarios',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Incidents',
    href: '/admin/incidents',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Improvements',
    href: '/admin/improvements',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Costs',
    href: '/admin/costs',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Investors',
    href: '/admin/investors',
    roles: [UserRole.ADMIN],
  },
  {
    label: 'OKRs',
    href: '/admin/okrs',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Experiments',
    href: '/admin/experiments',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Capacity',
    href: '/admin/capacity',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Succession',
    href: '/admin/succession',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Risks',
    href: '/admin/risks',
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    label: 'Board deck',
    href: '/admin/board-deck',
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Settings',
    href: '/admin/users',
    roles: [UserRole.ADMIN],
  },
]
