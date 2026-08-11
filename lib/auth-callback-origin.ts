import { DEFAULT_SITE_ORIGIN } from '@/lib/site-url'

/**
 * Origin for magic-link redirect_to / callback URLs.
 * Localhost is allowed for non-prod founder QA; production stays on bornfidis.com.
 * Never trust arbitrary Host headers for non-local origins.
 */
export function resolveMagicLinkOrigin(requestOrigin?: string | null): string {
  if (!requestOrigin?.trim()) return DEFAULT_SITE_ORIGIN
  try {
    const u = new URL(requestOrigin.trim())
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      return u.origin
    }
    if (u.hostname === 'bornfidis.com' || u.hostname === 'www.bornfidis.com') {
      return DEFAULT_SITE_ORIGIN
    }
  } catch {
    // fall through
  }
  return DEFAULT_SITE_ORIGIN
}
