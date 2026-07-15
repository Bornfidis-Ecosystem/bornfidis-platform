/**
 * Phase 4 — Visual grouping for AppNav pills (aligns with Culinary OS IA).
 * Prefer explicit `group` on NavItem when present; else derive from href.
 */
import type { AdminNavGroupId } from '@/lib/nav-config'
import { ADMIN_NAV_GROUP_LABEL as CORE_LABELS, PRIMARY_NAV_ITEMS } from '@/lib/nav-config'

export type AdminNavVisualGroup = AdminNavGroupId | 'portal' | 'labs'

export const ADMIN_NAV_GROUP_LABEL: Record<AdminNavVisualGroup, string> = {
  ...CORE_LABELS,
  portal: 'Portal',
  labs: 'Labs',
}

/** Tailwind classes: compact pill, color tint for scanability */
export const ADMIN_NAV_GROUP_STYLES: Record<AdminNavVisualGroup, string> = {
  command:
    'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 hover:bg-emerald-100/95 focus-visible:ring-emerald-600/40',
  sales:
    'border-sky-200/90 bg-sky-50/95 text-midnight hover:bg-sky-100/95 focus-visible:ring-sky-600/40',
  delivery:
    'border-amber-200/90 bg-amber-50/95 text-amber-950 hover:bg-amber-100/95 focus-visible:ring-amber-600/40',
  finance:
    'border-gold/50 bg-gold/10 text-navy hover:bg-gold/25 focus-visible:ring-gold/60',
  people:
    'border-cyan-200/90 bg-cyan-50/95 text-cyan-950 hover:bg-cyan-100/95 focus-visible:ring-cyan-600/40',
  system:
    'border-gray-300/90 bg-gray-100/95 text-gray-900 hover:bg-gray-200/95 focus-visible:ring-gray-600/40',
  portal:
    'border-stone-200/90 bg-stone-50/95 text-stone-800 hover:bg-stone-100/95 focus-visible:ring-stone-500/40',
  labs:
    'border-violet-200/90 bg-violet-50/95 text-violet-950 hover:bg-violet-100/95 focus-visible:ring-violet-600/40',
}

const primaryByHref = new Map(
  PRIMARY_NAV_ITEMS.map((item) => [item.href.split('?')[0].split('#')[0], item.group]),
)

export function getAdminNavVisualGroup(href: string): AdminNavVisualGroup {
  const base = href.split('?')[0].split('#')[0]
  if (base === '/partner' || base === '/farmer' || base === '/chef') return 'portal'
  if (base === '/admin/labs' || base.startsWith('/admin/labs/')) return 'labs'

  const fromPrimary = primaryByHref.get(base)
  if (fromPrimary) return fromPrimary

  // Labs / legacy deep links still opened from bookmarks
  if (
    base.startsWith('/admin/academy') ||
    base.startsWith('/admin/design-agent') ||
    base.startsWith('/admin/schedule') ||
    base.startsWith('/admin/forecast') ||
    base.startsWith('/admin/scenarios') ||
    base.startsWith('/admin/surge') ||
    base.startsWith('/admin/margin') ||
    base.startsWith('/admin/investors') ||
    base.startsWith('/admin/experiments') ||
    base.startsWith('/admin/succession') ||
    base.startsWith('/admin/board-deck') ||
    base.startsWith('/admin/okrs') ||
    base.startsWith('/admin/capacity') ||
    base.startsWith('/admin/risks') ||
    base.startsWith('/admin/coaching') ||
    base.startsWith('/admin/leaderboard') ||
    base.startsWith('/admin/education') ||
    base.startsWith('/admin/quotes/builder')
  ) {
    return 'labs'
  }

  if (base.startsWith('/admin/payments') || base.startsWith('/admin/payouts') || base.startsWith('/admin/costs') || base.startsWith('/admin/ops')) {
    return 'finance'
  }
  if (base.startsWith('/admin/chefs') || base.startsWith('/admin/farmers') || base.startsWith('/admin/cooperative')) {
    return 'people'
  }
  if (base.startsWith('/admin/system') || base.startsWith('/admin/users')) return 'system'
  if (base.startsWith('/admin/bookings') || base.startsWith('/admin/submissions') || base.startsWith('/admin/clients') || base.startsWith('/admin/quotes') || base.startsWith('/admin/digital-studio')) {
    return 'sales'
  }
  if (base.startsWith('/admin/provisions') || base.startsWith('/admin/testimonials') || base.startsWith('/admin/incidents')) {
    return 'delivery'
  }
  if (base === '/admin' || base.startsWith('/admin/calendar')) return 'command'
  return 'system'
}
