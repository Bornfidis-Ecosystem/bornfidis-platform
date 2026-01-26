import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { replicationRegionSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 7B: Apply as region leader
 * POST /api/replication/apply-leader
 * 
 * Public route - accepts region leader applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = replicationRegionSchema.parse(body)

    // Insert replication region application
    const { data: region, error } = await supabaseAdmin
      .from('replication_regions')
      .insert({
        name: validated.name,
        country: validated.country,
        city: validated.city || null,
        region_description: validated.region_description || null,
        leader_name: validated.leader_name,
        leader_email: validated.leader_email,
        leader_phone: validated.leader_phone || null,
        leader_bio: validated.leader_bio || null,
        leader_experience: validated.leader_experience || null,
        impact_goal: validated.impact_goal || null,
        target_communities: validated.target_communities || [],
        expected_farmers: validated.expected_farmers || 0,
        expected_chefs: validated.expected_chefs || 0,
        capital_needed_cents: validated.capital_needed_cents || 0,
        support_needed: validated.support_needed || [],
        website_url: validated.website_url || null,
        social_media: validated.social_media || null,
        status: 'inquiry',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating replication region application:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.leader_phone) {
      sendSubmissionConfirmationSMS(validated.leader_phone, validated.leader_name, 'region leader application').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      region_id: region.id,
    })
  } catch (error: any) {
    console.error('Error in replication region application:', error)
    
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
