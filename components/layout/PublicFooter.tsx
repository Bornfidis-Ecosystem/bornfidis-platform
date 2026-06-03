import Link from 'next/link'

import { PHASE1_CTA, PHASE1_PRIMARY_PRODUCTS } from '@/lib/phase1-marketing'

/**
 * Global public footer — Phase 1 revenue focus.
 */

const EXPERIENCE_LINKS = [
  { href: '/private-dining', label: 'Private Dining' },
  { href: PHASE1_CTA.bookCookingClass.href, label: PHASE1_CTA.bookCookingClass.label },
  { href: PHASE1_CTA.bookNow.href, label: PHASE1_CTA.bookNow.label },
] as const

const BORNFIDIS_LINKS = [
  { href: '/our-story', label: 'Our Story' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
] as const

const linkClass =
  'font-display text-[0.9375rem] text-white/45 no-underline transition-colors duration-200 hover:text-[#FAF6F0]'
const colTitleClass =
  'mb-6 font-sans text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]'

export default function PublicFooter() {
  return (
    <footer className="w-full bg-[#2C2C2C] px-6 py-20 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">
          <div>
            <div className="font-display text-[1.75rem] font-normal text-[#FAF6F0]">Bornfidis</div>
            <div className="mt-2 mb-6 font-display text-sm italic text-[#C9A84C]">
              Caribbean Heart. Vermont Hands.
            </div>
            <p className="max-w-sm font-display text-sm leading-relaxed text-white/35">
              Caribbean-inspired private dining, cooking classes, and small-batch provisions rooted
              in Jamaica and Vermont. Born for this. Made for your table.
            </p>
          </div>

          <div>
            <p className={colTitleClass}>Experience</p>
            <ul className="flex flex-col gap-3">
              {EXPERIENCE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={colTitleClass}>Provisions</p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href={PHASE1_CTA.requestProduct.href} className={linkClass}>
                  {PHASE1_CTA.requestProduct.label}
                </Link>
              </li>
              {PHASE1_PRIMARY_PRODUCTS.map((p) => (
                <li key={p.id}>
                  <Link href={p.href} className={linkClass}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={colTitleClass}>Bornfidis</p>
            <ul className="flex flex-col gap-3">
              {BORNFIDIS_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:hello@bornfidis.com" className={linkClass}>
                  hello@bornfidis.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-sans text-[0.625rem] font-medium tracking-[0.1em] text-white/20">
            &copy; {new Date().getFullYear()} Bornfidis LLC &middot; Cavendish, Vermont &middot; Port
            Antonio, Jamaica
          </p>
          <div className="flex gap-8">
            <a
              href="https://bornfidis.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.625rem] font-medium tracking-[0.1em] text-white/20 no-underline transition-colors hover:text-white/50"
            >
              Privacy
            </a>
            <a
              href="https://bornfidis.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.625rem] font-medium tracking-[0.1em] text-white/20 no-underline transition-colors hover:text-white/50"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
