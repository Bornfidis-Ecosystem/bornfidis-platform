import type { ReactNode } from 'react'

import BookingCulinaryNav from '@/components/layout/BookingCulinaryNav'
import { PublicEditorialFooter } from '@/components/layout/PublicEditorialFooter'

type PublicMarketingShellProps = {
  children: ReactNode
  /** Highlight nav item: book | experience | menu | story | contact */
  active?: 'book' | 'experience' | 'menu' | 'story' | 'academy' | 'contact'
  /** Show minimal editorial footer (default true) */
  showFooter?: boolean
}

/**
 * Shared Bone / Slate / Gold shell for public marketing pages (WordPress + Culinary OS parity).
 */
export function PublicMarketingShell({
  children,
  active,
  showFooter = true,
}: PublicMarketingShellProps) {
  return (
    <div className="public-editorial-root min-h-screen bg-[#fdf8f8] text-[#2c2c2c]">
      <BookingCulinaryNav active={active} />
      <main className="mx-auto w-full max-w-[1440px]">{children}</main>
      {showFooter ? <PublicEditorialFooter /> : null}
    </div>
  )
}
