import type { ReactNode } from 'react'

type PublicMarketingShellProps = {
  children: ReactNode
  /**
   * Retained for backwards-compatibility with existing callers. Navigation is now provided by the
   * single global PublicNav (components/layout/PublicNav.tsx); this prop no longer renders a nav.
   */
  active?: 'book' | 'experience' | 'menu' | 'story' | 'academy' | 'contact'
  /** Retained for backwards-compatibility; the footer is now the single global PublicFooter. */
  showFooter?: boolean
}

/**
 * Shared Bone / Slate / Gold shell for public marketing pages (WordPress + Culinary OS parity).
 * The global PublicNav sits above this shell and the global PublicFooter below it, so neither nav
 * nor footer is rendered here.
 */
export function PublicMarketingShell({ children }: PublicMarketingShellProps) {
  return (
    <div className="public-editorial-root min-h-screen bg-bone text-[#1a1a1a]">
      <main className="mx-auto w-full max-w-[1440px]">{children}</main>
    </div>
  )
}
