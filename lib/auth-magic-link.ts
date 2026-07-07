import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_SITE_ORIGIN } from '@/lib/site-url'

/** Production auth callback — always bornfidis.com. */
export function buildAuthCallbackUrl(nextPath = '/admin'): string {
  const next = nextPath.startsWith('/') ? nextPath : '/admin'
  return `${DEFAULT_SITE_ORIGIN}/auth/callback?next=${encodeURIComponent(next)}`
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

export async function generateAdminMagicLink(
  email: string,
  redirectTo: string
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
