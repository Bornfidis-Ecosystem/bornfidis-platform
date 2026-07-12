/**
 * Bornfidis design tokens — single source of truth for non-CSS surfaces
 * (PDFs, emails, charts, inline styles).
 *
 * Website CSS (`app/globals.css`) remains authoritative for the live site;
 * keep these hex values aligned with `--color-navy`, `--color-gold`, `--color-bone`.
 */

/** Canonical brand palette */
export const brand = {
  navy: '#002747',
  gold: '#FFBC00',
  ivory: '#FAF6F0',
  white: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#5C6470',
  /** Hairline rules / table dividers on ivory surfaces */
  border: '#E5E5E5',
  /** Hover / pressed gold */
  goldHover: '#E6A800',
  /** Slightly lighter navy for secondary chart series */
  navyMuted: '#33526C',
  /** Soft gold for secondary chart series (~80% gold on light) */
  goldMuted: '#FFD04D',
  navyDark: '#001A2E',
  navyLight: '#003D6B',
  /** System states — unchanged semantics */
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#DC2626',
} as const

export type BrandColor = (typeof brand)[keyof typeof brand]

/**
 * Chart / dashboard metric hierarchy (Phase 2C).
 * Prefer these over ad-hoc greens for business metrics.
 */
export const chartColors = {
  revenue: brand.navy,
  bookings: brand.gold,
  leads: brand.navyMuted,
  conversion: brand.goldMuted,
  provisions: brand.navy,
  academy: brand.navyMuted,
  sportswear: '#CE472E',
  proju: brand.gold,
} as const

/**
 * PDF / legacy `colors.*` API — aliases resolve to the canonical brand.
 * Prefer `brand.*` in new code.
 */
export const colors = {
  navy: brand.navy,
  gold: brand.gold,
  white: brand.white,
  card: brand.ivory,
  text: brand.text,
  muted: brand.muted,
  border: brand.border,
  /** @deprecated Use brand.navy — forest maps to navy for brand unification */
  forest: brand.navy,
  /** @deprecated Use brand.navy */
  forestDark: brand.navy,
  /** @deprecated Use brand.navyDark */
  forestDarker: brand.navyDark,
  goldAccent: brand.goldMuted,
  goldDark: brand.goldHover,
  success: brand.success,
} as const

/** WordPress / platform marketing alignment (same hexes as `brand`). */
export const wordpressAlignedBrand = {
  bone: brand.ivory,
  slate: brand.text,
  gold: brand.gold,
  navy: brand.navy,
  forestCta: brand.navy,
  ctaTextOnForest: brand.ivory,
} as const
