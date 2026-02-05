export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { checkAdminAccess } from '@/lib/requireAdmin'
import { createServerSupabaseClient } from '@/lib/auth'

/**
 * Debug endpoint to check authentication status
 * GET /api/admin/debug-auth
 * 
 * Helps diagnose authentication issues
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const adminCheck = await checkAdminAccess()

    return NextResponse.json({
      authenticated: !!user,
      authError: authError?.message || null,
      user: user ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      } : null,
      adminCheck: {
        isAdmin: adminCheck.isAdmin,
        error: adminCheck.error,
        hasUser: !!adminCheck.user,
      },
      role: user ? (user.user_metadata?.role || user.app_metadata?.role || 'none') : 'not_authenticated',
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 })
  }
}
