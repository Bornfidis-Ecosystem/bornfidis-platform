import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

/**
 * Phase 11G: Update farmer application
 * POST /api/admin/farmers/[id]/update
 * 
 * Admin-only route
 */
const updateSchema = z.object({
  status: z.enum(['new', 'reviewed', 'approved', 'declined']).optional(),
  notes: z.string().optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const applicationId = params.id
    const body = await request.json()
    const validated = updateSchema.parse(body)

    const updateData: any = {}
    if (validated.status !== undefined) {
      updateData.status = validated.status
    }
    if (validated.notes !== undefined) {
      updateData.notes = validated.notes
    }

    const { data, error } = await supabaseAdmin
      .from('farmers_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating farmer application:', error)
      return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 })
    }

    return NextResponse.json({ success: true, application: data })
  } catch (error: any) {
    console.error('Error in update farmer application API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
