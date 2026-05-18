'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { brandAssets } from '@/lib/brand-assets'
import { wordpressAlignedBrand } from '@/lib/wp-platform-integration'

const { bone, slate, gold } = wordpressAlignedBrand

export type CulinaryNavActive = 'book' | 'experience' | 'menu' | 'story'

const NAV_ITEMS: { href: string; label: string; key: CulinaryNavActive }[] = [
  { href: '/experience', label: 'Experience', key: 'experience' },
  { href: '/menu', label: 'Menus', key: 'menu' },
  { href: '/story', label: 'Story', key: 'story' },
  { href: '/book', label: 'Book', key: 'book' },
]

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

type BookingCulinaryNavProps = {
  active?: CulinaryNavActive
}

/** Guest-facing editorial nav — Experience · Menus · Story · Book only. */
export default function BookingCulinaryNav({ active }: BookingCulinaryNavProps) {
  const scrollY = useScrollY()
  const navScrolled = scrollY > 48
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const linkClass = (key: CulinaryNavActive) =>
    [
      'font-sans text-[12px] font-semibold uppercase tracking-[0.1em] no-underline transition-colors duration-refined',
      active === key ? 'text-[#C9A84C]' : 'text-[#2c2c2c]/70 hover:text-[#C9A84C]',
    ].join(' ')

  const mobileLinkClass = (key: CulinaryNavActive) =>
    [
      'block py-3 font-sans text-sm font-semibold uppercase tracking-[0.12em] no-underline transition-colors',
      active === key ? 'text-[#C9A84C]' : 'text-[#2c2c2c]',
    ].join(' ')

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-4 py-4 sm:px-6 md:px-16 md:py-5"
        style={{
          transition: 'background 0.4s ease, border-color 0.4s ease',
          backgroundColor: navScrolled ? bone : `${bone}ee`,
          borderBottom: `1px solid ${navScrolled ? gold : 'transparent'}`,
        }}
      >
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 no-underline sm:gap-3">
          <Image
            src={brandAssets.iconNavTlGold}
            alt="Bornfidis Provisions"
            width={40}
            height={40}
            className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            priority
          />
          <span
            className="truncate font-display text-[1.05rem] font-normal tracking-[0.06em] sm:text-[1.15rem]"
            style={{ color: slate }}
          >
            Bornfidis
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.key)}>
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="guest-nav-mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span
            className={`block h-px w-6 bg-[#2c2c2c] transition-transform ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`}
          />
          <span className={`block h-px w-6 bg-[#2c2c2c] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span
            className={`block h-px w-6 bg-[#2c2c2c] transition-transform ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {mobileOpen ? (
        <div
          id="guest-nav-mobile-menu"
          className="fixed inset-0 z-[99] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#2c2c2c]/30"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute left-0 right-0 top-[4.25rem] border-b border-[#C9A84C]/35 px-6 py-6"
            style={{ backgroundColor: bone }}
          >
            <ul className="divide-y divide-[#C9A84C]/25">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={mobileLinkClass(item.key)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
