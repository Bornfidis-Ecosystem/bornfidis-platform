/**
 * Validate return paths used after login / magic-link callbacks.
 * Only same-origin relative paths are allowed (no open redirects).
 */

const DEFAULT_CUSTOMER_NEXT = '/dashboard/library'
const DEFAULT_ADMIN_NEXT = '/admin'

/**
 * Returns a safe internal path or the provided fallback.
 * Rejects protocol-relative URLs, absolute URLs, and backslash tricks.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_CUSTOMER_NEXT,
): string {
  const fallbackSafe =
    typeof fallback === 'string' &&
    fallback.startsWith('/') &&
    !fallback.startsWith('//') &&
    !fallback.includes('\\')
      ? fallback
      : DEFAULT_CUSTOMER_NEXT

  if (raw == null) return fallbackSafe
  let value = String(raw).trim()
  if (!value) return fallbackSafe

  // Decode once for encoded attacks like %2F%2Fevil.com
  try {
    value = decodeURIComponent(value)
  } catch {
    return fallbackSafe
  }
  value = value.trim()

  if (!value.startsWith('/')) return fallbackSafe
  if (value.startsWith('//')) return fallbackSafe
  if (value.includes('\\')) return fallbackSafe
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return fallbackSafe // http:, javascript:, etc.
  if (value.includes('://')) return fallbackSafe

  return value
}

/** Customer library / Academy return URL builder. */
export function customerLoginHref(nextPath?: string | null): string {
  const next = safeNextPath(nextPath, DEFAULT_CUSTOMER_NEXT)
  return `/account/login?next=${encodeURIComponent(next)}`
}

export function defaultCustomerNext(): string {
  return DEFAULT_CUSTOMER_NEXT
}

export function defaultAdminNext(): string {
  return DEFAULT_ADMIN_NEXT
}

/** Whether a return path should use the customer login error surface. */
export function isCustomerAppPath(path: string): boolean {
  const p = safeNextPath(path, '/')
  return (
    p.startsWith('/dashboard') ||
    p.startsWith('/account') ||
    p.startsWith('/academy')
  )
}
