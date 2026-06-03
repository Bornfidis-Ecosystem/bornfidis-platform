'use client'

import { usePathname } from 'next/navigation'
import PublicFooter from '@/components/layout/PublicFooter'

/**
 * Renders the single global public footer on every public route.
 * The /admin/* area uses the Culinary OS shell and ships its own chrome, so it is excluded.
 */
export default function ConditionalPublicFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <PublicFooter />
}
