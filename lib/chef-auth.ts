import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Verify chef authentication
 * Checks if user is authenticated via Supabase Auth and is a chef
 * Returns chef ID if authenticated, null otherwise
 */
export async function getAuthenticatedChef(): Promise<{ chefId: string } | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user || !user.email) {
      return null
    }

    // Check if user is a chef by email
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select('id, email, status')
      .eq('email', user.email)
      .single()

    if (chefError || !chef) {
      return null
    }

    // Check if chef is approved/active
    if (chef.status !== 'approved' && chef.status !== 'active') {
      return null
    }

    return { chefId: chef.id }
  } catch (error) {
    console.error('Error verifying chef authentication:', error)
    return null
  }
}

/**
 * Require chef authentication for API routes
 * Returns NextResponse error if not authenticated, null if authenticated
 */
export async function requireChefAuth(request: NextRequest): Promise<NextResponse | null> {
  const chef = await getAuthenticatedChef()

  if (!chef) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in as a chef.' },
      { status: 401 }
    )
  }

  return null
}
