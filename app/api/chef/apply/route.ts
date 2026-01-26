import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { chefApplicationSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 5A: Chef Application Submission
 * POST /api/chef/apply
 * 
 * Creates a new chef application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = chefApplicationSchema.parse(body)

    // Check if email already exists
    const { data: existingChef, error: checkError } = await supabaseAdmin
      .from('chefs')
      .select('id, email, status')
      .eq('email', validated.email.toLowerCase())
      .single()

    if (existingChef) {
      return NextResponse.json(
        { success: false, error: 'An application with this email already exists.' },
        { status: 400 }
      )
    }

    // Insert new chef application
    const { data: chef, error: insertError } = await supabaseAdmin
      .from('chefs')
      .insert({
        email: validated.email.toLowerCase(),
        name: validated.name,
        phone: validated.phone || null,
        bio: validated.bio || null,
        experience_years: validated.experience_years || null,
        specialties: validated.specialties && validated.specialties.length > 0 ? validated.specialties : null,
        certifications: validated.certifications && validated.certifications.length > 0 ? validated.certifications : null,
        website_url: validated.website_url || null,
        instagram_handle: validated.instagram_handle || null,
        status: 'pending',
        application_submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating chef application:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'chef application').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      chef_id: chef.id,
    })
  } catch (error: any) {
    console.error('Error processing chef application:', error)
    
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
