export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { handleAuthCallback } from '@/lib/auth-callback-handler'

/**
 * Alias for /api/auth/callback — some Supabase configs use /auth/callback.
 * Prefer /api/auth/callback in Redirect URLs (confirmed live on bornfidis.com).
 */
export async function GET(request: NextRequest) {
  return handleAuthCallback(request)
}
