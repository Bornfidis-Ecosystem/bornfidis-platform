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
        <Image
          src={brandAssets.iconNavTlGold}
          alt="Bornfidis Provisions"
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
          priority
        />
        <span
          className="font-display text-[1.15rem] font-normal tracking-[0.06em]"
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

      <div className="flex items-center gap-6 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.key)}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
