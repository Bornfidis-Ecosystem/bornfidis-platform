export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { handleAuthCallback } from '@/lib/auth-callback-handler'

/**
 * Primary Supabase auth callback — magic links should redirect here.
 * Configure in Supabase → Auth → Redirect URLs: https://bornfidis.com/auth/callback
 */
export async function GET(request: NextRequest) {
  return handleAuthCallback(request)
}
