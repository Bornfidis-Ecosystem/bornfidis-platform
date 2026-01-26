import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 10B: Approve story
 * POST /api/admin/stories/[id]/approve
 * 
 * Admin-only route
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const storyId = params.id

    const { data, error } = await supabaseAdmin
      .from('stories')
      .update({ is_approved: true })
      .eq('id', storyId)
      .select()
      .single()

    if (error) {
      console.error('Error approving story:', error)
      return NextResponse.json({ success: false, error: 'Failed to approve story' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Story approved successfully', story: data })
  } catch (error: any) {
    console.error('Error in approve story API:', error)
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred' }, { status: 500 })
  }
}
