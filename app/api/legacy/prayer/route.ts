import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { prayerRequestSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 8A: Submit prayer request
 * POST /api/legacy/prayer
 * 
 * Public route - accepts prayer requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = prayerRequestSchema.parse(body)

    const { data: prayer, error } = await supabaseAdmin
      .from('prayer_requests')
      .insert(validated)
      .select()
      .single()

    if (error) {
      console.error('Error creating prayer request:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit prayer request' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name || 'Friend', 'prayer request').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Prayer request submitted successfully',
      prayer_id: prayer.id,
    })
  } catch (error: any) {
    console.error('Error in prayer request API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit prayer request' },
      { status: 500 }
    )
  }
}
