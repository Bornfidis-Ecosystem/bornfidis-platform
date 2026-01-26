import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { storySubmissionSchema } from '@/lib/validation'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 10B: Submit story
 * POST /api/stories/submit
 * 
 * Public route - accepts story submissions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = storySubmissionSchema.parse(body)

    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .insert({
        ...validated,
        is_approved: false,
        is_public: false,
        is_featured: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating story:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit story' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name || 'Friend', 'story').catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the submission if SMS fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Story submitted successfully. We will review it and publish if approved.',
      story_id: story.id,
    })
  } catch (error: any) {
    console.error('Error in story submission API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data: ' + error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit story' },
      { status: 500 }
    )
  }
}
