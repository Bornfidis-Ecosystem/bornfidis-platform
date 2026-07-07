export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { isAllowedAdminEmail } from '@/lib/auth'
import { absoluteSiteUrl, DEFAULT_SITE_ORIGIN } from '@/lib/site-url'

/**
 * Server-side admin magic link — always redirects to bornfidis.com/auth/callback.
 * Avoids client/env/Supabase Site URL sending users to platform.bornfidis.com.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const nextRaw = typeof body.next === 'string' ? body.next : '/admin'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Auth is not configured' }, { status: 500 })
    }

    // Avoid revealing allowlist — still return success for unknown emails.
    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json({ success: true })
    }

    const nextPath =
      nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/admin'
    const redirectTo = absoluteSiteUrl(
      `/auth/callback?next=${encodeURIComponent(nextPath)}`,
      DEFAULT_SITE_ORIGIN
    )

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
