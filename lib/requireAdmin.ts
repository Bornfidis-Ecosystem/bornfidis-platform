import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerAuthUser } from '@/lib/auth'

/**
 * Admin Guard Utility
 * 
 * Checks:
 * 1. User is authenticated
 * 2. User.role === 'admin' (from user_metadata or app_metadata)
 * 
 * Returns:
 * - For API routes: JSON error response
 * - For pages: Redirects to login or shows access denied
 */

interface AdminGuardResult {
  user: any
  isAdmin: boolean
  error?: string
}

/**
 * Check if user is authenticated and has admin role
 * Returns user and admin status without throwing
 */
export async function checkAdminAccess(): Promise<AdminGuardResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // First, try to get the session to ensure cookies are synced
    const { data: { session } } = await supabase.auth.getSession()
    
    // Then get the user
    const { data: { user }, error } = await supabase.auth.getUser()

    // Check authentication
    if (error || !user) {
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Admin access check failed - not authenticated:', {
          error: error?.message,
          hasSession: !!session,
          sessionUser: session?.user?.email,
        })
      }
      return {
        user: null,
        isAdmin: false,
        error: 'Not authenticated',
      }
    }

    // Check admin role
    // Supabase stores roles in user_metadata or app_metadata
    const role = user.user_metadata?.role || user.app_metadata?.role

    // Fallback: Check email allowlist if role is not set
    // This provides backward compatibility with the email-based admin system
    if (role !== 'admin') {
      // Import email check function
      const { isAllowedAdminEmail } = await import('@/lib/auth')
      
      // If email is in allowlist, grant admin access
      if (user.email && isAllowedAdminEmail(user.email)) {
        // Log for debugging (only in dev)
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Admin access granted via email allowlist: ${user.email}`)
        }
        return {
          user,
          isAdmin: true,
        }
      }

      // Log role check failure for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Admin role check:', {
          email: user.email,
          user_metadata_role: user.user_metadata?.role,
          app_metadata_role: user.app_metadata?.role,
          found_role: role,
        })
      }

      return {
        user,
        isAdmin: false,
        error: 'Access denied: Admin role required',
      }
    }

    return {
      user,
      isAdmin: true,
    }
  } catch (error: any) {
    console.error('Error checking admin access:', error)
    return {
      user: null,
      isAdmin: false,
      error: error.message || 'Authentication error',
    }
  }
}

/**
 * Require admin access for API routes
 * Returns NextResponse with error if not admin, or null if authorized
 * 
 * Usage in API routes:
 * ```typescript
 * const authError = await requireAdmin(request)
 * if (authError) return authError
 * // Continue with admin logic
 * ```
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const result = await checkAdminAccess()

  // Not authenticated - redirect to login
  if (!result.user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Authenticated but not admin - access denied
  if (!result.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Access denied: Admin role required' },
      { status: 403 }
    )
  }

  // Authorized
  return null
}

/**
 * Require admin access and return user
 * Throws error if not admin (for use in server actions/components)
 * 
 * Usage in server actions:
 * ```typescript
 * const user = await requireAdminUser()
 * // User is guaranteed to be admin
 * ```
 */
export async function requireAdminUser() {
  const result = await checkAdminAccess()

  if (!result.user) {
    throw new Error('Authentication required')
  }

  if (!result.isAdmin) {
    throw new Error('Access denied: Admin role required')
  }

  return result.user
}

/**
 * Get admin user or null (non-throwing)
 * Useful for optional admin checks
 */
export async function getAdminUser() {
  const result = await checkAdminAccess()
  return result.isAdmin ? result.user : null
}
