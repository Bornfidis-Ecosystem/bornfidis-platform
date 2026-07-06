import Image from 'next/image'
import Link from 'next/link'

import { brandAssets } from '@/lib/brand-assets'
import { brandCopyrightLine, BRAND_LEGAL } from '@/lib/brand-legal'
import { PHASE1_CTA, PHASE1_FOOTER_LINKS, PHASE1_PRIMARY_PRODUCTS } from '@/lib/phase1-marketing'

/**
 * Global public footer — navy canvas, gold accents, compass mark.
 */

const EXPERIENCE_LINKS = [
  { href: '/private-dining', label: 'Private Dining' },
  { href: PHASE1_CTA.bookCookingClass.href, label: PHASE1_CTA.bookCookingClass.label },
  { href: PHASE1_CTA.bookNow.href, label: PHASE1_CTA.bookNow.label },
] as const

const BORNFIDIS_LINKS = [
  { href: '/our-story', label: 'Our Story' },
  ...PHASE1_FOOTER_LINKS,
  { href: '/contact', label: 'Contact' },
] as const

const linkClass =
  'font-sans text-[0.9375rem] text-white/50 no-underline transition-colors duration-200 hover:text-[var(--color-bone)]'
const colTitleClass =
  'mb-6 font-sans text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]'

export default function PublicFooter() {
  return (
    <footer className="w-full border-t-[3px] border-[var(--color-gold)] bg-[var(--color-navy)] px-6 py-20 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Image src={brandAssets.markGold} alt="" width={40} height={40} className="h-10 w-10" />
              <span className="font-display text-[1.25rem] font-semibold text-[var(--color-gold)]">
                Bornfidis Provisions
              </span>
            </div>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-white/55">
              Chef-led private dining from {BRAND_LEGAL.locationsLine} — luxury-ship training, one table at a
              time. Small-batch provisions when you request a batch.
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
          <p className="font-sans text-[0.625rem] font-medium tracking-[0.1em] text-white/25">
            {brandCopyrightLine()}
          </p>
          <div className="flex gap-8">
            <a
              href="https://bornfidis.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.625rem] font-medium tracking-[0.1em] text-white/25 no-underline transition-colors hover:text-white/50"
            >
              Privacy
            </a>
            <a
              href="https://bornfidis.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.625rem] font-medium tracking-[0.1em] text-white/25 no-underline transition-colors hover:text-white/50"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
