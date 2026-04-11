import type { NextRequest } from 'next/server'

/**
 * Authorize scheduled Vercel Cron and manual `curl` runs.
 *
 * - **Vercel:** When `CRON_SECRET` is set on the project, Vercel sends
 *   `Authorization: Bearer <CRON_SECRET>` on cron invocations (see Vercel cron docs).
 * - **Manual:** Same header locally or from scripts.
 * - **Fallback:** Some invocations only show `vercel-cron` in `User-Agent`; allow that so
 *   scheduled jobs still succeed if headers differ. (Weaker than Bearer; keep `CRON_SECRET` long.)
 *
 * Returns false if `CRON_SECRET` is missing — set it in Vercel and `.env.local`.
 */
export function isAuthorizedCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return false
  }

  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) {
    return true
  }

  const ua = req.headers.get('user-agent') ?? ''
  if (ua.includes('vercel-cron')) {
    return true
  }

  return false
}
