import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cooperativeMemberSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 7A: Join cooperative application
 * POST /api/cooperative/join
 * 
 * Public route - accepts cooperative membership applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = cooperativeMemberSchema.parse(body)

    // Insert cooperative member application
    const { data: member, error } = await supabaseAdmin
      .from('cooperative_members')
      .insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        role: validated.role,
        region: validated.region,
        bio: validated.bio || null,
        website_url: validated.website_url || null,
        instagram_handle: validated.instagram_handle || null,
        farmer_id: validated.farmer_id || null,
        chef_id: validated.chef_id || null,
        status: 'pending',
        impact_score: 0,
        payout_share_percent: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating cooperative member application:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'cooperative membership').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      member_id: member.id,
    })
  } catch (error: any) {
    console.error('Error in cooperative join:', error)
    
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
