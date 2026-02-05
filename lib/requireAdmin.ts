import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { hasRole, ADMIN_AREA_ROLES } from '@/lib/require-role'

/**
 * Admin Guard Utility — Bornfidis Auth + Roles (Phase 1)
 *
 * Single source of truth: Prisma User.role
 * Allowed for admin area: ADMIN, STAFF, COORDINATOR (legacy)
 * Fallback: ADMIN_EMAILS allowlist for first-time setup before role is set
 */

interface AdminGuardResult {
  user: any
  role: string | null
  isAdmin: boolean
  error?: string
}

/**
 * Check if user is authenticated and has admin-area role (ADMIN, STAFF, COORDINATOR).
 * Returns user, role, and admin status without throwing.
 */
export async function checkAdminAccess(): Promise<AdminGuardResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Admin access check failed - not authenticated:', {
          error: error?.message,
          hasSession: !!session,
          sessionUser: session?.user?.email,
        })
      }
      return {
        user: null,
        role: null,
        isAdmin: false,
        error: 'Not authenticated',
      }
    }

    // Role from Prisma (synced from Supabase metadata / User table)
    const role = await getCurrentUserRole()

    if (hasRole(role, ADMIN_AREA_ROLES)) {
      return {
        user,
        role: role ?? null,
        isAdmin: true,
      }
    }

    // Fallback: email allowlist for first-time setup before role is set in DB
    const { isAllowedAdminEmail } = await import('@/lib/auth')
    if (user.email && isAllowedAdminEmail(user.email)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Admin access via allowlist (set role in DB): ${user.email}`)
      }
      return {
        user,
        role: role ?? null,
        isAdmin: true,
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Admin role check:', {
        email: user.email,
        prismaRole: role,
        allowed: ADMIN_AREA_ROLES,
      })
    }

    return {
      user,
      role: role ?? null,
      isAdmin: false,
      error: 'Access denied: Admin role required',
    }
  } catch (error: any) {
    console.error('Error checking admin access:', error)
    return {
      user: null,
      role: null,
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
