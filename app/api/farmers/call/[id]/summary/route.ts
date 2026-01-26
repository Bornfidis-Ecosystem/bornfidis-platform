import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

/**
 * Phase 11G.2: Save Call Summary
 * POST /api/farmers/call/[id]/summary
 * 
 * Admin/Coordinator only route
 */

const callSummarySchema = z.object({
  interest_level: z.enum(['high', 'medium', 'low', 'not_interested']).optional().nullable(),
  crops_confirmed: z.string().optional().nullable(),
  volume_estimate: z.string().optional().nullable(),
  preferred_contact_time: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  call_outcome: z.enum(['connected', 'no_answer', 'busy', 'failed', 'voicemail']).optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const callLogId = params.id
    const body = await request.json()
    const validated = callSummarySchema.parse(body)

    // Update call log with summary
    const { data: callLog, error } = await supabaseAdmin
      .from('farmer_call_logs')
      .update({
        interest_level: validated.interest_level || null,
        crops_confirmed: validated.crops_confirmed || null,
        volume_estimate: validated.volume_estimate || null,
        preferred_contact_time: validated.preferred_contact_time || null,
        notes: validated.notes || null,
        call_outcome: validated.call_outcome || null,
      })
      .eq('id', callLogId)
      .select()
      .single()

    if (error) {
      console.error('Error updating call summary:', error)
      return NextResponse.json({ success: false, error: 'Failed to update call summary' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Call summary saved successfully',
      call_log: callLog,
    })
  } catch (error: any) {
    console.error('Error in save call summary API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save call summary' },
      { status: 500 }
    )
  }
}
