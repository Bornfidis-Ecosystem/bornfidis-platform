/**
 * WordPress (bornfidis.com) ↔ platform.bornfidis.com integration constants.
 * See `.cursor/rules/platform-wordpress-integration.mdc` for full rules.
 */

export const WORDPRESS_ORIGIN = 'https://bornfidis.com' as const

function platformOriginFromEnv(): string | undefined {
  if (typeof process === 'undefined') return undefined
  const raw = process.env.NEXT_PUBLIC_PLATFORM_ORIGIN?.trim()
  return raw || undefined
}

/** Canonical platform base URL (no trailing slash). Production: bornfidis.com until platform subdomain DNS is live. */
export const PLATFORM_ORIGIN =
  platformOriginFromEnv() ?? 'https://bornfidis.com'

/** Default public booking path on the platform (WordPress CTAs should link here). */
export const PLATFORM_BOOKING_PATH = '/book' as const

export function platformBookingUrl(): string {
  const base = PLATFORM_ORIGIN.replace(/\/$/, '')
  return `${base}${PLATFORM_BOOKING_PATH}`
}

/** Marketing slugs owned by WordPress — avoid the same public paths on the same hostname. */
export const WORDPRESS_MARKETING_SLUGS = [
  '/private-dining',
  '/shop',
  '/provisions',
  '/journal',
  '/our-story',
  '/contact',
  '/academy', // placeholder on WP until redirect to academy.bornfidis.com
] as const

/** Platform-aligned brand (navy / gold / ivory). WordPress CTAs use forest on WP host only. */
export const wordpressAlignedBrand = {
  bone: '#faf6f0',
  slate: '#1a1a1a',
  gold: '#ffbc00',
  navy: '#002747',
  forestCta: '#002747',
  ctaTextOnForest: '#faf6f0',
} as const
