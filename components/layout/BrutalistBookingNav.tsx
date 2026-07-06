'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { brandAssets } from '@/lib/brand-assets'

const CREAM = '#faf6f0'
const GOLD = '#ffbc00'
const GOLD_DIM = 'rgba(255,188,0,0.18)'

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

/** Matches homepage editorial nav so /book feels like one experience. */
export default function BrutalistBookingNav() {
  const scrollY = useScrollY()
  const navScrolled = scrollY > 48

  const linkClass =
    'text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[rgba(250,246,240,0.55)] transition-colors hover:text-[#ffbc00] no-underline'

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-6 py-5 md:px-10"
      style={{
        transition:
          'background 0.4s ease, padding 0.4s ease, border-bottom 0.4s ease',
        backgroundColor: navScrolled ? 'rgba(8,8,8,0.92)' : 'rgba(8,8,8,0.5)',
        backdropFilter: navScrolled ? 'blur(12px)' : 'blur(8px)',
        borderBottom: navScrolled
          ? `1px solid ${GOLD_DIM}`
          : '1px solid transparent',
      }}
    >
      <Link href="/" className="flex items-center gap-3 no-underline">
        <Image
          src={brandAssets.markGold}
          alt="Bornfidis Provisions"
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
        />
        <span
          className="font-display"
          style={{
            fontSize: '1.3rem',
            color: CREAM,
            letterSpacing: '0.1em',
          }}
        >
          BORNFIDIS
        </span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link href="/experience" className={linkClass}>
          Experience
        </Link>
        <Link href="/menu" className={linkClass}>
          Menus
        </Link>
        <Link href="/story" className={linkClass}>
          Story
        </Link>
        <Link href="/contact" className={linkClass}>
          Contact
        </Link>
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]"
          style={{ color: GOLD }}
        >
          Book
        </span>
      </div>

      <Link
        href="/"
        className="btn-gold-outline no-underline md:hidden"
        style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}
      >
        Home
      </Link>
    </nav>
  )
}
