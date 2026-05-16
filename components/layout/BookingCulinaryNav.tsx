'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { cdnImages } from '@/lib/bornfidis-cdn-images'
import { wordpressAlignedBrand } from '@/lib/wp-platform-integration'

const { bone, slate, gold } = wordpressAlignedBrand

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

/** Editorial nav for /book — Culinary OS (Bone / Slate / Gold hairlines). */
export default function BookingCulinaryNav() {
  const scrollY = useScrollY()
  const navScrolled = scrollY > 48

  const linkClass =
    'font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/70 transition-colors duration-refined hover:text-[#C9A84C] no-underline'

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-6 py-5 md:px-16"
      style={{
        transition: 'background 0.4s ease, border-color 0.4s ease',
        backgroundColor: navScrolled ? bone : `${bone}ee`,
        borderBottom: `1px solid ${navScrolled ? gold : 'transparent'}`,
      }}
    >
      <Link href="/" className="flex items-center gap-3 no-underline">
        <Image
          src={cdnImages.iconGold}
          alt=""
          width={32}
          height={32}
          className="h-8 w-auto"
        />
        <span
          className="font-display text-[1.15rem] font-normal tracking-[0.06em]"
          style={{ color: slate }}
        >
          Bornfidis
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
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: gold }}
        >
          Book
        </span>
      </div>

      <Link
        href="/"
        className={`${linkClass} md:hidden`}
        style={{ color: slate }}
      >
        Home
      </Link>
    </nav>
  )
}
