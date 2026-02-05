import Link from 'next/link'
import { getNavForRole } from '@/lib/filter-nav'
import type { UserRole } from '@prisma/client'

/**
 * Phase 2A — Role-aware navigation
 * Renders only links the role is allowed to see. Server still enforces access.
 */
export function AppNav({ role }: { role: UserRole | string | null }) {
  const items = getNavForRole(role)

  if (items.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center gap-4" aria-label="Platform navigation">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-gray-700 hover:text-navy hover:underline"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
