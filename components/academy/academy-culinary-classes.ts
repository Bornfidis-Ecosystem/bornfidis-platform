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
  'border border-[#ffbc00]/35 bg-[#faf6f0] overflow-hidden transition-colors hover:border-[#ffbc00]/55'

export const academyPillActive =
  'rounded-none border border-[#002747] bg-[#002747] px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#faf6f0]'

export const academyPillInactive =
  'rounded-none border border-[#ffbc00]/35 bg-transparent px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]/70 transition hover:border-[#ffbc00] hover:text-[#1a1a1a]'

export const academyBtnPrimary =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#002747] bg-[#002747] px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#faf6f0] shadow-none transition hover:bg-[#001a2e] disabled:cursor-not-allowed disabled:opacity-60'

export const academyBtnSecondary =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#1a1a1a] bg-transparent px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] transition hover:border-[#ffbc00]'

export const academyLinkBack =
  'mb-8 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]/70 no-underline transition hover:text-[#ffbc00]'
