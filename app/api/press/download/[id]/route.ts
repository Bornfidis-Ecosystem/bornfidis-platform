import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 10B: Track press kit download
 * POST /api/press/download/[id]
 * 
 * Public route - tracks download count
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kitId = params.id

    // Get current download count
    const { data: kit } = await supabaseAdmin
      .from('press_kit')
      .select('download_count')
      .eq('id', kitId)
      .single()

    if (kit) {
      // Increment download count
      await supabaseAdmin
        .from('press_kit')
        .update({ download_count: (kit.download_count || 0) + 1 })
        .eq('id', kitId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error tracking download:', error)
    // Don't fail the request if tracking fails
    return NextResponse.json({ success: true })
  }
}
