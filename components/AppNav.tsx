'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavForRole } from '@/lib/filter-nav'
import {
  ADMIN_NAV_GROUP_LABEL,
  ADMIN_NAV_GROUP_STYLES,
  getAdminNavVisualGroup,
} from '@/lib/admin-nav-groups'
import type { UserRole } from '@prisma/client'

/** High-frequency destinations — filtered by role via full nav allowlist. */
const PINNED_DAILY_TOOLS: { href: string; label: string }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/calendar', label: 'Calendar' },
  { href: '/admin/quotes', label: 'Quotes' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/testimonials', label: 'Testimonials' },
]

function linkIsActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Role-aware admin navigation: pinned daily tools, then full scrollable pills by area.
 */
export function AppNav({ role }: { role: UserRole | string | null }) {
  const pathname = usePathname() ?? ''
  const items = getNavForRole(role)

  if (items.length === 0) {
    return null
  }

  const allowedHrefs = new Set(items.map((i) => i.href))
  const pinnedVisible = PINNED_DAILY_TOOLS.filter((p) => allowedHrefs.has(p.href))

  return (
    <div className="min-w-0 space-y-2">
      {pinnedVisible.length > 0 && (
        <div className="rounded-lg border border-[#1A3C34]/12 bg-white/90 px-2 py-2 shadow-sm">
          <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1A3C34]/80">
            Daily tools
          </p>
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Pinned daily shortcuts"
          >
            {pinnedVisible.map((p) => {
              const active = linkIsActive(p.href, pathname)
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={[
                    'inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1',
                    active
                      ? 'border-gold/70 bg-gold/25 text-navy ring-1 ring-navy/25'
                      : 'border-stone-200/90 bg-stone-50/80 text-navy hover:border-gold/50 hover:bg-gold/10',
                  ].join(' ')}
                >
                  {p.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      <div className="min-w-0">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-stone-500">
        All sections — scroll sideways
      </p>
      <nav
        className="-mx-1 flex gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pb-1 pt-0.5 [scrollbar-width:thin]"
        aria-label="Admin navigation"
      >
        {items.map((item) => {
          const group = getAdminNavVisualGroup(item.href)
          const groupLabel = ADMIN_NAV_GROUP_LABEL[group]
          const isActive = linkIsActive(item.href, pathname)
          const style = ADMIN_NAV_GROUP_STYLES[group]

          return (
            <Link
              key={item.href}
              href={item.href}
              title={`${item.label} · ${groupLabel}`}
              className={[
                'shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold leading-tight shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                style,
                isActive ? 'ring-2 ring-navy ring-offset-1 ring-offset-white' : 'ring-0',
              ].join(' ')}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      </div>
    </div>
  )
}
