/** Re-export Culinary OS tokens for Academy public pages. */
export {
  bookBody as academyBody,
  bookEyebrow as academyEyebrow,
  bookFieldClass as academyFieldClass,
  bookHeadline as academyHeadline,
  bookLabelClass as academyLabelClass,
  bookSection as academySection,
} from '@/components/booking/book-culinary-classes'

export const academyCard =
  'border border-gold/35 bg-bone overflow-hidden transition-colors hover:border-gold/55'

export const academyPillActive =
  'rounded-none border border-navy bg-navy px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-bone'

export const academyPillInactive =
  'rounded-none border border-gold/35 bg-transparent px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal/70 transition hover:border-gold hover:text-charcoal'

export const academyBtnPrimary =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-navy bg-navy px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-bone shadow-none transition hover:bg-forestDarker disabled:cursor-not-allowed disabled:opacity-60'

export const academyBtnSecondary =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-charcoal bg-transparent px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal transition hover:border-gold'

export const academyLinkBack =
  'mb-8 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal/70 no-underline transition hover:text-gold'
