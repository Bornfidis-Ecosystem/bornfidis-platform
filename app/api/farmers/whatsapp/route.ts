import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sendWhatsApp } from '@/lib/twilio'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

/**
 * Phase 11G.3: Send WhatsApp to Farmer
 * POST /api/farmers/whatsapp
 * 
 * Coordinator/Admin only route
 */

const whatsAppSchema = z.object({
  farmer_id: z.string().uuid('Invalid farmer ID'),
  phone: z.string().min(10, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication (coordinator/admin)
    await requireAuth()
    
    const body = await request.json()
    const validated = whatsAppSchema.parse(body)

    // Verify farmer exists
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

    // Send WhatsApp via Twilio
    const whatsAppResult = await sendWhatsAppMessage(validated.phone, validated.message)

    if (!whatsAppResult.success) {
      return NextResponse.json(
        { success: false, error: whatsAppResult.error || 'Failed to send WhatsApp' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp sent successfully',
      message_sid: whatsAppResult.messageSid,
    })
  } catch (error: any) {
    console.error('Error in send WhatsApp API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send WhatsApp' },
      { status: 500 }
    )
  }
}
