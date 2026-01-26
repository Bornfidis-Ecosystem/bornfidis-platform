import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { farmerApplicationSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 6A: Farmer application submission
 * POST /api/farm/apply
 * 
 * Public route - accepts farmer applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = farmerApplicationSchema.parse(body)

    // Insert farmer application
    const { data: farmer, error } = await supabaseAdmin
      .from('farmers')
      .insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        location: validated.location,
        parish: validated.parish || null,
        country: validated.country || 'Jamaica',
        regenerative_practices: validated.regenerative_practices || null,
        certifications: validated.certifications || [],
        crops: validated.crops || [],
        proteins: validated.proteins || [],
        processing_capabilities: validated.processing_capabilities || [],
        website_url: validated.website_url || null,
        instagram_handle: validated.instagram_handle || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating farmer application:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    // Email notification will be sent automatically after successful SMS
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'farmer application', {
        email: validated.email,
        location: validated.location,
        parish: validated.parish,
        country: validated.country,
        regenerativePractices: validated.regenerative_practices,
        certifications: validated.certifications,
        crops: validated.crops,
        proteins: validated.proteins,
        processingCapabilities: validated.processing_capabilities,
        websiteUrl: validated.website_url,
        instagramHandle: validated.instagram_handle,
      }).catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      farmer_id: farmer.id,
    })
  } catch (error: any) {
    console.error('Error in farmer application:', error)
    
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
