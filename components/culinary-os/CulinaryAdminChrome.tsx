'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import SignOutButton from '@/components/admin/SignOutButton'
import AdminPushWrap from '@/components/push/AdminPushWrap'
import type { NavItem } from '@/lib/nav-config'

function linkIsActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

type CulinaryAdminChromeProps = {
  children: ReactNode
  navItems: NavItem[]
  user: { email?: string | null }
  role: string | null
  /** Hide Operations Hub / System links for hospitality-only roles (Phase 1.1). */
  showFinancialShortcuts?: boolean
}

function SidebarNavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <ul className="flex flex-col gap-1 p-0">
      {items.map((item) => {
        const active = linkIsActive(item.href, pathname)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={[
                'flex items-center gap-3 border-l-2 px-4 py-3 font-culinary-sans text-label-caps uppercase tracking-[0.1em] transition-colors',
                active
                  ? 'border-culinary-gold-line bg-white font-bold text-culinary-ink'
                  : 'border-transparent text-culinary-text-muted hover:bg-culinary-surface-high hover:text-culinary-ink',
              ].join(' ')}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Full-viewport Culinary OS shell: fixed sidebar, operational main canvas, mobile drawer.
 * Matches stitch reference: Bornfidis Culinary OS (zero radius, no shadows, Inter + Libre Caslon).
 */
export function CulinaryAdminChrome({ children, navItems, user, role }: CulinaryAdminChromeProps) {
  const pathname = usePathname() ?? ''
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, closeMobile])

  const displayRole = role ?? 'USER'

  return (
    <div className="flex min-h-screen flex-col bg-culinary-bone font-culinary-sans text-culinary-ink antialiased md:flex-row">
      {/* Mobile top bar */}
      <header className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-culinary-outline-variant bg-culinary-bone-yaml px-margin-mobile py-4 md:hidden">
        <div className="font-culinary-display text-headline-lg-mobile text-culinary-ink">Bornfidis</div>
        <button
          type="button"
          className="min-h-[44px] min-w-[44px] rounded-none border border-culinary-outline bg-white px-3 py-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-culinary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-culinary-bone"
          aria-expanded={mobileOpen}
          aria-controls="culinary-admin-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          Menu
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-culinary-navy/40 md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        id="culinary-admin-nav"
        className={[
          'fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col border-r border-culinary-outline-variant bg-culinary-surface-low py-stack-md',
          'transform transition-transform duration-200 ease-out md:static md:z-0 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        aria-label="Operations navigation"
      >
        <div className="mb-stack-lg px-4">
          <Link href="/admin" className="block rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-culinary-gold">
            <span className="font-culinary-display text-headline-lg tracking-tight text-culinary-ink">Bornfidis</span>
            <p className="mt-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted">
              Culinary OS
            </p>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2" aria-label="Primary">
          <SidebarNavLinks items={navItems} pathname={pathname} onNavigate={closeMobile} />
        </nav>

        <div className="mt-auto flex flex-col gap-stack-sm border-t border-culinary-outline-variant px-4 pt-stack-md">
          {showFinancialShortcuts ? (
            <>
              <Link
                href="/admin/ops"
                onClick={closeMobile}
                className="block rounded-none bg-culinary-navy px-4 py-3 text-center font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-on-navy transition-colors hover:bg-culinary-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-culinary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-culinary-surface-low"
              >
                Operations Hub
              </Link>
              <Link
                href="/admin/system"
                onClick={closeMobile}
                className="flex items-center gap-3 py-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted hover:text-culinary-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-culinary-gold"
              >
                Settings
              </Link>
            </>
          ) : null}
          <Link
            href="/contact"
            onClick={closeMobile}
            className="flex items-center gap-3 py-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted hover:text-culinary-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-culinary-gold"
          >
            Support
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col pt-[72px] md:pt-0">
        <div className="border-b border-culinary-outline-variant bg-culinary-surface-low px-margin-mobile py-3 md:px-margin-desktop">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <span
                className="rounded-none border border-culinary-outline bg-white px-2 py-1 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-navy"
                title="Your role"
              >
                {displayRole}
              </span>
              {user.email ? (
                <span className="truncate font-culinary-sans text-body-md text-culinary-text-muted" title={user.email}>
                  {user.email}
                </span>
              ) : null}
            </div>
            <SignOutButton />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] px-margin-mobile py-stack-lg md:px-margin-desktop md:py-stack-xl">
            <AdminPushWrap />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
