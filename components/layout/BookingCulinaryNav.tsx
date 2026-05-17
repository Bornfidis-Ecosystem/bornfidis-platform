'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { cdnImages } from '@/lib/bornfidis-cdn-images'
import { wordpressAlignedBrand } from '@/lib/wp-platform-integration'

const { bone, slate, gold, forestCta, ctaTextOnForest } = wordpressAlignedBrand

export type CulinaryNavActive = 'book' | 'experience' | 'menu' | 'academy' | 'story' | 'contact'

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

/** Editorial nav — Culinary OS (Bone / Slate / Gold). Used across /book and marketing pages. */
export default function BookingCulinaryNav({ active }: BookingCulinaryNavProps) {
  const scrollY = useScrollY()
  const navScrolled = scrollY > 48

  const linkClass = (key: CulinaryNavActive) =>
    [
      'font-sans text-[12px] font-semibold uppercase tracking-[0.1em] no-underline transition-colors duration-refined',
      active === key ? 'text-[#C9A84C]' : 'text-[#2c2c2c]/70 hover:text-[#C9A84C]',
    ].join(' ')

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
        <Image src={cdnImages.iconGold} alt="" width={32} height={32} className="h-8 w-auto" />
        <span
          className="font-display text-[1.15rem] font-normal tracking-[0.06em]"
          style={{ color: slate }}
        >
          Bornfidis
        </span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link href="/experience" className={linkClass('experience')}>
          Experience
        </Link>
        <Link href="/menu" className={linkClass('menu')}>
          Menus
        </Link>
        <Link href="/academy" className={linkClass('academy')}>
          Academy
        </Link>
        <Link href="/story" className={linkClass('story')}>
          Story
        </Link>
        <Link href="/contact" className={linkClass('contact')}>
          Contact
        </Link>
        <Link
          href="/book"
          className="inline-flex min-h-[40px] items-center justify-center rounded-none px-5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] no-underline shadow-none transition-colors duration-refined"
          style={{
            backgroundColor: active === 'book' ? forestCta : forestCta,
            color: ctaTextOnForest,
            border: `1px solid ${forestCta}`,
          }}
        >
          Book Private Dining
        </Link>
      </div>

      <Link href="/book" className={`${linkClass('book')} md:hidden`}>
        Book
      </Link>
    </nav>
  )
}
