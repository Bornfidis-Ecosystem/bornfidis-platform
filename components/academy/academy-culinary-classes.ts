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
  'border border-[#C9A84C]/35 bg-[#fdf8f8] overflow-hidden transition-colors hover:border-[#C9A84C]/55'

export const academyPillActive =
  'rounded-none border border-[#1A3C34] bg-[#1A3C34] px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#fdf8f8]'

export const academyPillInactive =
  'rounded-none border border-[#C9A84C]/35 bg-transparent px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/70 transition hover:border-[#C9A84C] hover:text-[#2c2c2c]'

export const academyBtnPrimary =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#1A3C34] bg-[#1A3C34] px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#fdf8f8] shadow-none transition hover:bg-[#15352d] disabled:cursor-not-allowed disabled:opacity-60'

export const academyBtnSecondary =
  'inline-flex min-h-[48px] items-center justify-center rounded-none border border-[#2c2c2c] bg-transparent px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c] transition hover:border-[#C9A84C]'

export const academyLinkBack =
  'mb-8 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/70 no-underline transition hover:text-[#C9A84C]'
