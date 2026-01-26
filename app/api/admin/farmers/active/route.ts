import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6A: Get active farmers for dropdowns
 * GET /api/admin/farmers/active
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { data: farmers, error } = await supabaseAdmin
      .from('farmers')
      .select('id, name, email, status, payout_percentage')
      .eq('status', 'approved')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching active farmers:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch farmers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      farmers: farmers || [],
    })
  } catch (error: any) {
    console.error('Error in getActiveFarmers:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch farmers' },
      { status: 500 }
    )
  }
}
