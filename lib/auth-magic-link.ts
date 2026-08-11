import { resolveMagicLinkOrigin } from '@/lib/auth-callback-origin'
import { safeNextPath, defaultAdminNext } from '@/lib/safe-next-path'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_SITE_ORIGIN } from '@/lib/site-url'

/** Auth callback URL with sanitized `next` (blocks open redirects). */
export function buildAuthCallbackUrl(
  nextPath = '/admin',
  options?: { requestOrigin?: string | null },
): string {
  const next = safeNextPath(nextPath, defaultAdminNext())
  const origin = resolveMagicLinkOrigin(options?.requestOrigin)
  return `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`
}

/** Force Supabase verify links to redirect to bornfidis.com, not platform subdomain. */
export function sanitizeSupabaseMagicLink(actionLink: string, redirectTo: string): string {
  try {
    const url = new URL(actionLink)
    url.searchParams.set('redirect_to', redirectTo)
    return url.toString().replace(/https?:\/\/platform\.bornfidis\.com/gi, DEFAULT_SITE_ORIGIN)
  } catch {
    return actionLink.replace(/https?:\/\/platform\.bornfidis\.com/gi, DEFAULT_SITE_ORIGIN)
  }
}

/** Shared Supabase magic-link generator (no allowlist — callers enforce policy). */
export async function generateMagicLink(
  email: string,
  redirectTo: string,
): Promise<{ link: string } | { error: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' }
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  })

  if (error) {
    return { error: error.message }
  }

  const rawLink = data.properties?.action_link
  if (!rawLink) {
    return { error: 'No magic link returned from Supabase' }
  }

  return { link: sanitizeSupabaseMagicLink(rawLink, redirectTo) }
}

/** @deprecated Prefer generateMagicLink — kept for admin route call sites. */
export async function generateAdminMagicLink(
  email: string,
  redirectTo: string,
): Promise<{ link: string } | { error: string }> {
  return generateMagicLink(email, redirectTo)
}

export async function generateCustomerMagicLink(
  email: string,
  redirectTo: string,
): Promise<{ link: string } | { error: string }> {
  return generateMagicLink(email, redirectTo)
}
