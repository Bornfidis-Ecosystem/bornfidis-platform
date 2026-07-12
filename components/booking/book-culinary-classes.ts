import { brand } from '@/lib/design-tokens'

/** Bornfidis public booking — compass-and-anchor tokens (style-only). */
export const BOOK_BONE = brand.ivory
export const BOOK_SLATE = brand.text
export const BOOK_GOLD = brand.gold
export const BOOK_NAVY = brand.navy

/** @deprecated use BOOK_NAVY */
export const BOOK_FOREST = BOOK_NAVY

export const bookSection = 'border-t border-gold/35 py-16 md:py-[120px]'

export const bookEyebrow =
  'mb-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-gold'

export const bookHeadline =
  'font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.2] tracking-tight text-charcoal'

export const bookBody = 'text-base leading-relaxed text-charcoal/80 md:text-lg'

export const bookFieldClass =
  'w-full rounded-none border-0 border-b border-charcoal bg-transparent px-0 py-2.5 font-sans text-sm text-charcoal placeholder:text-charcoal/40 shadow-none focus:border-gold focus:outline-none focus:ring-0'

export const bookLabelClass =
  'mb-1 block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal'

/** Uppercase text link — gold highlight on hover, active, and keyboard focus. */
export const marketingTextLink =
  'inline-flex font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-navy underline decoration-gold/60 underline-offset-4 transition-colors hover:text-gold active:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2'
