/**
 * Visual grouping for admin nav pills (derived from href — no per-link config in nav-config).
 * Order matters: more specific paths before broader prefixes.
 */
export type AdminNavVisualGroup =
  | 'core'
  | 'provisions'
  | 'academy'
  | 'schedule'
  | 'people'
  | 'quality'
  | 'partners'
  | 'finance'
  | 'strategy'
  | 'operations'
  | 'system'

export const ADMIN_NAV_GROUP_LABEL: Record<AdminNavVisualGroup, string> = {
  core: 'Overview & CRM',
  provisions: 'Provisions',
  academy: 'Academy',
  schedule: 'Schedule',
  people: 'People & chefs',
  quality: 'Reviews & quality',
  partners: 'Partners & invites',
  finance: 'Pricing & payouts',
  strategy: 'Strategy & OKRs',
  operations: 'Operations & planning',
  system: 'System',
}

/** Tailwind classes: compact pill, color tint for scanability */
export const ADMIN_NAV_GROUP_STYLES: Record<AdminNavVisualGroup, string> = {
  core:
    'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 hover:bg-emerald-100/95 focus-visible:ring-emerald-600/40',
  provisions:
    'border-sky-200/90 bg-sky-50/95 text-[#002747] hover:bg-sky-100/95 focus-visible:ring-sky-600/40',
  academy:
    'border-violet-200/90 bg-violet-50/95 text-violet-950 hover:bg-violet-100/95 focus-visible:ring-violet-600/40',
  schedule:
    'border-slate-200/90 bg-slate-50/95 text-slate-900 hover:bg-slate-100/95 focus-visible:ring-slate-600/40',
  people:
    'border-amber-200/90 bg-amber-50/95 text-amber-950 hover:bg-amber-100/95 focus-visible:ring-amber-600/40',
  quality:
    'border-rose-200/90 bg-rose-50/95 text-rose-900 hover:bg-rose-100/95 focus-visible:ring-rose-600/40',
  partners:
    'border-cyan-200/90 bg-cyan-50/95 text-cyan-950 hover:bg-cyan-100/95 focus-visible:ring-cyan-600/40',
  finance:
    'border-[#c9a227]/50 bg-[#FFF9E6]/95 text-navy hover:bg-gold/25 focus-visible:ring-gold/60',
  strategy:
    'border-purple-200/90 bg-purple-50/95 text-purple-950 hover:bg-purple-100/95 focus-visible:ring-purple-600/40',
  operations:
    'border-stone-200/90 bg-stone-50/95 text-stone-800 hover:bg-stone-100/95 focus-visible:ring-stone-500/40',
  system:
    'border-gray-300/90 bg-gray-100/95 text-gray-900 hover:bg-gray-200/95 focus-visible:ring-gray-600/40',
}

export function getAdminNavVisualGroup(href: string): AdminNavVisualGroup {
  if (href === '/admin') return 'core'
  if (
    href.startsWith('/admin/bookings') ||
    href.startsWith('/admin/clients') ||
    href.startsWith('/admin/testimonials')
  ) {
    return 'core'
  }
  if (href.startsWith('/admin/provisions-pipeline') || href.startsWith('/admin/quotes')) {
    return 'provisions'
  }
  if (
    href.startsWith('/admin/academy-products') ||
    href.startsWith('/admin/design-agent') ||
    href.startsWith('/admin/academy')
  ) {
    return 'academy'
  }
  if (href.startsWith('/admin/schedule') || href.startsWith('/admin/calendar')) return 'schedule'
  if (href.startsWith('/admin/farmers')) return 'people'
  if (href.startsWith('/admin/chefs/performance')) return 'people'
  if (href.startsWith('/admin/chefs')) return 'people'
  if (href.startsWith('/admin/education')) return 'people'
  if (href.startsWith('/admin/coaching') || href.startsWith('/admin/leaderboard')) return 'people'
  if (href.startsWith('/admin/reviews')) return 'quality'
  if (href.startsWith('/admin/cooperative') || href.startsWith('/admin/invites')) return 'partners'
  if (
    href.startsWith('/admin/payouts') ||
    href.startsWith('/admin/currency') ||
    href.startsWith('/admin/region-pricing') ||
    href.startsWith('/admin/surge-pricing') ||
    href.startsWith('/admin/margin-guardrails')
  ) {
    return 'finance'
  }
  if (
    href.startsWith('/admin/investors') ||
    href.startsWith('/admin/okrs') ||
    href.startsWith('/admin/experiments') ||
    href.startsWith('/admin/board-deck')
  ) {
    return 'strategy'
  }
  if (href.startsWith('/admin/system') || href.startsWith('/admin/users')) return 'system'
  return 'operations'
}
