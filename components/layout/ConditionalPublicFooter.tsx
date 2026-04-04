'use client'

import { usePathname } from 'next/navigation'
import PublicFooter from '@/components/layout/PublicFooter'

/** Hides the global footer on routes that ship their own footer (e.g. marketing home). */
export default function ConditionalPublicFooter() {
  const pathname = usePathname()
  if (pathname === '/' || pathname === '/book') return null
  return <PublicFooter />
}
