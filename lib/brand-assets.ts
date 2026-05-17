/**
 * Brand asset paths (public/ folder).
 * Mortar-and-pestle mark: TL medallion for nav; standard gold for favicon / small sizes.
 */
export const brandAssets = {
  /** Primary nav — TL gold with double outer ring (medallion). Use at ≥48px. */
  iconNavTlGold: '/brand/icons/bornfidis_logo_icon_tl__gold_.png',
  /** Favicon, app icon, WhatsApp/IG profile — standard gold (no rings, legible under 48px). */
  iconGold: '/brand/icons/bornfidis_logo_icon_gold.png',
  /** Logo for light backgrounds (e.g. admin login card) */
  logoLight: '/brand/logos/logo-lockup-navy-on-white.png',
  /** Logo for dark backgrounds (nav, footer) — gold lockup or icon */
  logoDark: '/brand/logos/logo-lockup-gold-on-navy.png',
  /** @deprecated Legacy anchor icon — prefer iconNavTlGold / iconGold */
  iconAnchorGold: '/brand/icons/icon-anchor-gold.png',
  /** @deprecated Legacy anchor icon — prefer iconGold for favicon */
  iconAnchorNavy: '/brand/icons/icon-anchor-navy.png',
  /** Legacy single-file logo (public/logo.png) */
  logoLegacy: '/logo.png',
} as const
