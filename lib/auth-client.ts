'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })
}

// Singleton Supabase client to avoid multiple instances warning
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Create Supabase client for client-side auth operations
 * Uses @supabase/ssr createBrowserClient to sync localStorage to cookies
 * This ensures server-side auth can read the session
 */
export function createClientSupabaseClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are not set')
      // This will fail, but at least the app won't crash
      throw new Error('Supabase environment variables are not set')
    }
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

/**
 * Get current authenticated user on client
 */
export async function getClientAuthUser() {
  try {
    const supabase = createClientSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error in getClientAuthUser:', error)
    return null
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const supabase = createClientSupabaseClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
