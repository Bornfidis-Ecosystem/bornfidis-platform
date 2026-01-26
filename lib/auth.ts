import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Get allowed admin emails from environment variable
 * Format: comma-separated list (e.g., "admin1@example.com,admin2@example.com")
 * TODO: Phase 3 - Replace with role-based access control from database
 */
export function getAllowedAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || ''
  return adminEmails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
}

/**
 * Check if an email is allowed to access admin
 * TODO: Phase 3 - Replace with role-based check from database
 */
export function isAllowedAdminEmail(email: string): boolean {
  const allowedEmails = getAllowedAdminEmails()
  return allowedEmails.includes(email.toLowerCase())
}

/**
 * Create Supabase client for server-side auth operations
 * Uses cookies for session management (Next.js App Router compatible)
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

/**
 * Get current authenticated user on server
 * Returns null if not authenticated or email not in allowed list
 */
export async function getServerAuthUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user || !user.email) {
      return null
    }

    // Check if user's email is in allowed admin emails
    if (!isAllowedAdminEmail(user.email)) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use in server components and server actions
 */
export async function requireAuth() {
  const user = await getServerAuthUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}
