import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { partnerInquirySchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 10B: Submit partner inquiry
 * POST /api/partners/inquire
 * 
 * Public route - accepts partner inquiries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = partnerInquirySchema.parse(body)

    const { data: inquiry, error } = await supabaseAdmin
      .from('partner_inquiries')
      .insert({
        ...validated,
        status: 'submitted',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating partner inquiry:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit inquiry' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name || 'Friend', 'partner inquiry').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully. We will be in touch soon.',
      inquiry_id: inquiry.id,
    })
  } catch (error: any) {
    console.error('Error in partner inquiry API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
