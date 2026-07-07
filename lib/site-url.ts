/**
 * Canonical public site origin — production lives on bornfidis.com (not platform subdomain until DNS is set).
 */
const DEFAULT_ORIGIN = 'https://bornfidis.com'

export function siteOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return DEFAULT_ORIGIN
}

export function absoluteSiteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${siteOrigin()}${normalized}`
}

/** Admin magic-link callback — exchange PKCE code server-side. */
export function authCallbackUrl(nextPath = '/admin'): string {
  const next = nextPath.startsWith('/') ? nextPath : '/admin'
  return absoluteSiteUrl(`/api/auth/callback?next=${encodeURIComponent(next)}`)
}
