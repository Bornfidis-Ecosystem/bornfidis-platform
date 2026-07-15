/**
 * Lightweight in-memory rate limit for public form endpoints.
 * Best-effort on serverless (per-instance); does not replace WAF/edge limits.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function checkFormRateLimit(
  key: string,
  opts: { limit?: number; windowMs?: number } = {},
): { ok: true } | { ok: false; retryAfterSec: number } {
  const limit = opts.limit ?? 8
  const windowMs = opts.windowMs ?? 60_000
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) }
  }

  existing.count += 1
  return { ok: true }
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}
