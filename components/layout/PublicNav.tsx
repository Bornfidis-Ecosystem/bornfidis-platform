'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { brandAssets } from '@/lib/brand-assets'
import { PHASE1_CTA, PHASE1_NAV_LINKS } from '@/lib/phase1-marketing'

/**
 * Bornfidis — Phase 1 public navigation (compass-and-anchor identity).
 * Ivory bar · navy mark · navy primary CTA · gold accent hairline only.
 */
export default function PublicNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen])

  if (pathname?.startsWith('/admin')) return null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  const linkClass = (href: string) =>
    [
      'font-sans text-[0.75rem] font-semibold uppercase tracking-[0.18em] no-underline transition-colors duration-200',
      isActive(href) ? 'text-[var(--color-navy)]' : 'text-[var(--color-muted)] hover:text-[var(--color-navy)]',
    ].join(' ')

  const ctaClass =
    'inline-flex items-center justify-center rounded-none bg-[var(--color-navy)] px-5 py-2.5 font-sans text-[0.75rem] font-semibold tracking-[0.15em] text-[var(--color-bone)] no-underline shadow-none transition-opacity duration-200 hover:opacity-90'

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] h-[72px] border-b border-[var(--color-gold)]/25 bg-[var(--color-bone)]">
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image
              src={brandAssets.markNavy}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
              priority
            />
            <span className="font-display text-[0.9375rem] font-semibold leading-none tracking-[0.02em] text-[var(--color-navy)]">
              Bornfidis
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {PHASE1_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>

          <Link href={PHASE1_CTA.bookNow.href} className={`hidden lg:inline-flex ${ctaClass}`}>
            {PHASE1_CTA.bookNow.label}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="-mr-2 p-2 text-[var(--color-navy)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] lg:hidden"
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <div aria-hidden className="h-[72px]" />

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] z-[100] border-b border-[var(--color-gold)]/25 bg-[var(--color-bone)] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            {PHASE1_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={`${linkClass(link.href)} py-3`}>
                {link.label}
              </Link>
            ))}
            <Link href={PHASE1_CTA.bookNow.href} className={`mt-3 px-5 py-3 ${ctaClass}`}>
              {PHASE1_CTA.bookNow.label}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
