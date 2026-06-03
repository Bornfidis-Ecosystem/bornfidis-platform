'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/chef', label: 'Home', icon: '🏠' },
  { href: '/chef/bookings', label: 'Bookings', icon: '📅' },
  { href: '/chef/availability', label: 'Availability', icon: '✓' },
  { href: '/chef/payouts', label: 'Payouts', icon: '💰' },
] as const

/**
 * Phase 2AE — Mobile-first bottom nav. 4 items max, 44px+ tap targets.
 * Visible only on small screens (md:hidden).
 */
export default function ChefBottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 safe-area-pb"
      role="navigation"
      aria-label="Chef main"
    >
      <div className="grid grid-cols-4 h-14 min-h-[44px] max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== '/chef' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 text-xs font-medium min-h-[44px] touch-manipulation active:bg-gray-100"
              style={{ minHeight: 44 }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg leading-none" aria-hidden>{icon}</span>
              <span className={isActive ? 'text-forestDark' : 'text-gray-500'}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
