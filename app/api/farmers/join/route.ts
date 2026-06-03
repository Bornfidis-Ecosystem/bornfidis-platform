import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendFarmerWelcomeSMS, sendCoordinatorNotificationSMS, sendWhatsAppMessage, sendCoordinatorWhatsAppNotification } from '@/lib/twilio'
import { normalizePhoneNumber } from '@/lib/phone-normalize'
import { z } from 'zod'

/**
 * Phase 11G.1: Farmer Join Endpoint
 * POST /api/farmers/join
 * 
 * Accepts farmer applications with parish field
 * Sends SMS to farmer and coordinators
 */

const farmerJoinSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  parish: z.string().optional().nullable(),
  acres: z.string().optional().nullable(),
  crops: z.string().optional().nullable(),
  voice_ready: z.boolean().optional().default(false),
  language: z.enum(['en', 'pat']).optional().default('en'),
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

    // Normalize phone number (handles Jamaica + US)
    const phoneNormalized = normalizePhoneNumber(validated.phone)
    if (!phoneNormalized.isValid) {
      return NextResponse.json(
        { success: false, error: phoneNormalized.error || 'Invalid phone number' },
        { status: 400 }
      )
    }
    
    const formattedPhone = phoneNormalized.normalized

    // Save to Supabase
    const { data: application, error: dbError } = await supabaseAdmin
      .from('farmers_applications')
      .insert({
        name: validated.name,
        phone: formattedPhone,
        parish: validated.parish || null,
        acres: validated.acres ? parseFloat(validated.acres) : null,
        crops: validated.crops || null,
        status: 'new',
        voice_ready: validated.voice_ready || false,
        // Store language preference (can be used for future communications)
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

    // Send SMS to farmer (non-blocking)
    sendFarmerWelcomeSMS(formattedPhone, validated.name).catch(error => {
      console.error('Failed to send farmer welcome SMS:', error)
      // Don't fail the request if SMS fails
    })

    // Send WhatsApp to farmer if enabled (non-blocking)
    const useWhatsApp = process.env.ENABLE_WHATSAPP === 'true'
    if (useWhatsApp) {
      sendWhatsAppMessage(
        formattedPhone,
        `Bornfidis Portland: Thank you for joining our farmer network. We will call you soon to connect your farm to chefs and markets. 🇯🇲🌱`
      ).catch(error => {
        console.error('Failed to send farmer welcome WhatsApp:', error)
        // Don't fail the request if WhatsApp fails
      })
    }

    // Send SMS to coordinators (non-blocking)
    sendCoordinatorNotificationSMS(
      validated.name,
      validated.parish || null,
      formattedPhone,
      validated.crops || null,
      validated.acres || null
    ).catch(error => {
      console.error('Failed to send coordinator notification SMS:', error)
      // Don't fail the request if SMS fails
    })

    // Send WhatsApp to coordinators if enabled (non-blocking)
    if (useWhatsApp) {
      sendCoordinatorWhatsAppNotification(
        validated.name,
        validated.parish || null,
        formattedPhone,
        validated.crops || null,
        validated.acres || null
      ).catch(error => {
        console.error('Failed to send coordinator WhatsApp notification:', error)
        // Don't fail the request if WhatsApp fails
      })
    }

    console.log('Portland farmer application saved:', application.id)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. You will receive a confirmation text shortly.',
      application_id: application.id,
    })
  } catch (error: any) {
    console.error('Error in farmer join API:', error)
    
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
