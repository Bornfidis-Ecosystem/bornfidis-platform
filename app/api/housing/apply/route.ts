import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { housingResidentSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 8B: Submit housing application
 * POST /api/housing/apply
 * 
 * Public route - accepts housing applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Set default status to 'applied'
    const data = {
      ...body,
      status: 'applied',
      equity_cents: 0,
      rent_cents: 0,
      monthly_payment_cents: 0,
    }
    
    const validated = housingResidentSchema.parse(data)

    const { data: resident, error } = await supabaseAdmin
      .from('housing_residents')
      .insert(validated)
      .select()
      .single()

    if (error) {
      console.error('Error creating housing application:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name || 'Friend', 'housing application').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      resident_id: resident.id,
    })
  } catch (error: any) {
    console.error('Error in housing application API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}
