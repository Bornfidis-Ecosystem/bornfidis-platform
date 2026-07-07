/**
 * Canonical public site origin.
 * Production lives on bornfidis.com until platform.bornfidis.com DNS is configured.
 */
export const DEFAULT_SITE_ORIGIN = 'https://bornfidis.com'

/** Origins that must never be used for auth redirects or absolute links. */
const BLOCKED_ORIGINS = new Set([
  'https://platform.bornfidis.com',
  'http://platform.bornfidis.com',
])

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, '')
}

function isBlockedOrigin(origin: string): boolean {
  return BLOCKED_ORIGINS.has(normalizeOrigin(origin))
}

/** Resolve origin from env, blocking deprecated platform subdomain. */
export function siteOrigin(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
  ]

  for (const raw of candidates) {
    if (!raw?.trim()) continue
    const origin = normalizeOrigin(raw)
    if (!isBlockedOrigin(origin)) return origin
  }

  return DEFAULT_SITE_ORIGIN
}

/** Client-safe origin — prefer the page the user is on (e.g. bornfidis.com). */
export function resolveSiteOrigin(preferredOrigin?: string): string {
  if (preferredOrigin) {
    const origin = normalizeOrigin(preferredOrigin)
    if (!isBlockedOrigin(origin)) return origin
  }
  return siteOrigin()
}

export function absoluteSiteUrl(path: string, preferredOrigin?: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${resolveSiteOrigin(preferredOrigin)}${normalized}`
}

/** Supabase OTP redirect — server-side default; pass window.location.origin on the client. */
export function authCallbackUrl(nextPath = '/admin', preferredOrigin?: string): string {
  const next = nextPath.startsWith('/') ? nextPath : '/admin'
  return absoluteSiteUrl(`/auth/callback?next=${encodeURIComponent(next)}`, preferredOrigin)
}
