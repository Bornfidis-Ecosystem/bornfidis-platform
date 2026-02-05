export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sign Out Route
 * Phase 2B: Handles server-side sign out
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
