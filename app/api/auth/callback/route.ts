export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth Callback Route
 * Handles Supabase Auth redirects after magic link click
 * Phase 2B: Processes authentication tokens
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/admin/bookings'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // Redirect to login with error
      return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(error.message)}`, request.url))
    }
  }

  // Redirect to admin dashboard
  return NextResponse.redirect(new URL(next, request.url))
}
