import Image from 'next/image'
import Link from 'next/link'

import { cdnImages } from '@/lib/bornfidis-cdn-images'

const links = [
  { href: '/experience', label: 'Experience' },
  { href: '/menu', label: 'Menus' },
  { href: '/academy', label: 'Academy' },
  { href: '/story', label: 'Story' },
  { href: '/contact', label: 'Contact' },
  { href: '/book', label: 'Book' },
] as const

/** Minimal Bone/Slate footer for public marketing shell pages. */
export function PublicEditorialFooter() {
  return (
    <footer className="border-t border-[#C9A84C]/35 bg-[#fdf8f8] px-6 py-16 text-center md:px-16 md:py-20">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center">
        <Image src={cdnImages.iconGold} alt="" width={36} height={36} className="h-9 w-auto" />
        <p className="mt-4 font-display text-xl font-normal tracking-[0.04em] text-[#2c2c2c]">
          Bornfidis Provisions
        </p>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3" aria-label="Footer">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/65 no-underline transition hover:text-[#C9A84C]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-10 font-sans text-xs text-[#2c2c2c]/50">
          &copy; {new Date().getFullYear()} Bornfidis Provisions · Vermont & Jamaica
        </p>
      </div>
    </footer>
  )
}
