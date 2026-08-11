import { createServerSupabaseClient } from '@/lib/auth'
import {
  customerLoginHref,
  defaultAdminNext,
  isCustomerAppPath,
  safeNextPath,
} from '@/lib/safe-next-path'
import { NextRequest, NextResponse } from 'next/server'

/** Shared Supabase PKCE callback — used by /auth/callback and /api/auth/callback. */
export async function handleAuthCallback(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNextPath(requestUrl.searchParams.get('next'), defaultAdminNext())

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const loginPath = isCustomerAppPath(next)
        ? customerLoginHref(next)
        : `/admin/login?next=${encodeURIComponent(next)}`
      const errUrl = new URL(loginPath, request.url)
      errUrl.searchParams.set('error', error.message)
      return NextResponse.redirect(errUrl)
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
