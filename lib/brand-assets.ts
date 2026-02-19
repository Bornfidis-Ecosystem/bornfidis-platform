/**
 * Brand asset paths (public/ folder).
 * See docs/BRANDING_GUIDE.md for where to place logo files.
 */
export const brandAssets = {
  /** Logo for light backgrounds (e.g. admin login card) */
  logoLight: '/brand/logos/logo-lockup-navy-on-white.png',
  /** Logo for dark backgrounds (nav, footer) — gold lockup or icon */
  logoDark: '/brand/logos/logo-lockup-gold-on-navy.png',
  /** Icon only — gold (for dark nav/footer) */
  iconGold: '/brand/icons/icon-anchor-gold.png',
  /** Icon only — navy (for light backgrounds / favicon) */
  iconNavy: '/brand/icons/icon-anchor-navy.png',
  /** Legacy single-file logo (public/logo.png) */
  logoLegacy: '/logo.png',
} as const
