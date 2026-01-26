import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { impactInvestorSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 7B: Impact investor application
 * POST /api/replication/invest
 * 
 * Public route - accepts impact investor applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = impactInvestorSchema.parse(body)

    // Insert impact investor application
    const { data: investor, error } = await supabaseAdmin
      .from('impact_investors')
      .insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        organization: validated.organization || null,
        region_interest: validated.region_interest || [],
        capital_committed_cents: validated.capital_committed_cents || 0,
        capital_paid_cents: 0,
        investment_type: validated.investment_type || null,
        status: 'inquiry',
        website_url: validated.website_url || null,
        linkedin_url: validated.linkedin_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating impact investor application:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'investment inquiry').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Investment inquiry submitted successfully',
      investor_id: investor.id,
    })
  } catch (error: any) {
    console.error('Error in impact investor application:', error)
    
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
