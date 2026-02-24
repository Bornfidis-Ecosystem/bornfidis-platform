import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

/**
 * Phase 11G: Portland Farmer Join
 * POST /api/portland/farmer-join
 * 
 * Public route - accepts farmer join applications
 * Saves to Supabase and sends SMS confirmation via Twilio (if configured)
 */

const farmerJoinSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  acres: z.string().optional().nullable(),
  crops: z.string().optional().nullable(),
})

// Simple rate limiting (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = farmerJoinSchema.parse(body)

    // Format phone number (remove non-digits)
    const phoneNumber = validated.phone.replace(/\D/g, '')
    if (phoneNumber.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Format as E.164 (US numbers)
    const formattedPhone = phoneNumber.length === 10 ? `+1${phoneNumber}` : `+${phoneNumber}`

    // Save to Supabase
    const { data: application, error: dbError } = await supabaseAdmin
      .from('farmers_applications')
      .insert({
        name: validated.name,
        phone: formattedPhone,
        acres: validated.acres ? parseFloat(validated.acres) : null,
        crops: validated.crops || null,
        status: 'new',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving farmer application:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
      })
      return NextResponse.json(
        { success: false, error: 'Failed to save application. Please try again.' },
        { status: 500 }
      )
    }

    // Send SMS confirmation (non-blocking)
    sendSubmissionConfirmationSMS(formattedPhone, validated.name, 'farmer application').catch((smsError) => {
      console.error('Error sending SMS (non-blocking):', smsError)
      // Don't fail the request if SMS fails - application is already saved
    })

    console.log('Portland farmer application saved:', application.id)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.',
      application_id: application.id,
    })
  } catch (error: any) {
    console.error('Error in Portland farmer join API:', error)
    
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

