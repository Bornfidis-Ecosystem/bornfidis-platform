import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 11G.2: Get Call History for Farmer
 * GET /api/farmers/call/[id]
 * 
 * Admin/Coordinator only route
 * Returns call logs for a specific farmer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const farmerId = params.id

    const { data: callLogs, error } = await supabaseAdmin
      .from('farmer_call_logs')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching call logs:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch call logs' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      call_logs: callLogs || [],
    })
  } catch (error: any) {
    console.error('Error in get call history API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
