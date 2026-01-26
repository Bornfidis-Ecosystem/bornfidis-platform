import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { initiateFarmerCall } from '@/lib/twilio-voice'
import { z } from 'zod'

/**
 * Phase 11G.2: Initiate Call to Farmer
 * POST /api/farmers/call
 * 
 * Admin/Coordinator only route
 */

const initiateCallSchema = z.object({
  farmer_id: z.string().uuid('Invalid farmer ID'),
  coordinator_phone: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication (coordinator/admin)
    const user = await requireAuth()
    
    const body = await request.json()
    const validated = initiateCallSchema.parse(body)

    // Get farmer details
    const { data: farmer, error: farmerError } = await supabaseAdmin
      .from('farmers_applications')
      .select('id, name, phone')
      .eq('id', validated.farmer_id)
      .single()

    if (farmerError || !farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      )
    }

    // Initiate call via Twilio
    const callResult = await initiateFarmerCall({
      to: farmer.phone,
      from: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER || '',
      farmerId: farmer.id,
      coordinatorId: user.id,
      coordinatorPhone: validated.coordinator_phone || undefined,
    })

    if (!callResult.success) {
      return NextResponse.json(
        { success: false, error: callResult.error || 'Failed to initiate call' },
        { status: 500 }
      )
    }

    // Create call log entry
    const { data: callLog, error: logError } = await supabaseAdmin
      .from('farmer_call_logs')
      .insert({
        farmer_id: farmer.id,
        coordinator_id: user.id,
        call_sid: callResult.callSid,
        call_status: 'initiated',
        call_outcome: 'initiated',
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating call log:', logError)
      // Don't fail the request if log creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully',
      call_sid: callResult.callSid,
      call_log_id: callLog?.id,
    })
  } catch (error: any) {
    console.error('Error in initiate call API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate call' },
      { status: 500 }
    )
  }
}
