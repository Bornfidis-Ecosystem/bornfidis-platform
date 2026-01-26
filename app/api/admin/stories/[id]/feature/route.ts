import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 10B: Feature/unfeature story
 * POST /api/admin/stories/[id]/feature
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
    const body = await request.json()
    const { is_featured } = body

    const { data, error } = await supabaseAdmin
      .from('stories')
      .update({ is_featured: is_featured })
      .eq('id', storyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating story feature status:', error)
      return NextResponse.json({ success: false, error: 'Failed to update story' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Story updated successfully', story: data })
  } catch (error: any) {
    console.error('Error in feature story API:', error)
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred' }, { status: 500 })
  }
}
