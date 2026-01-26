import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/twilio'
import { sendCoordinatorNotificationSMS } from '@/lib/twilio'
import { transcribeAudio } from '@/lib/transcribe'
import { extractFarmerFields } from '@/lib/voice-extract'
import { normalizePhoneNumber } from '@/lib/phone-normalize'

/**
 * Phase 11G.2: Twilio WhatsApp Webhook
 * Handles inbound WhatsApp messages and voice notes
 */

// Simple rate limiting (in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10 // 10 requests per minute per IP

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

/**
 * Validate Twilio signature (optional)
 */
function validateTwilioSignature(request: NextRequest, body: string): boolean {
  const authEnabled = process.env.TWILIO_WEBHOOK_AUTH === 'true'
  const secret = process.env.TWILIO_WEBHOOK_SECRET

  if (!authEnabled || !secret) {
    if (authEnabled && !secret) {
      console.warn('TWILIO_WEBHOOK_AUTH is true but TWILIO_WEBHOOK_SECRET not set')
    }
    return true // Skip validation if not configured
  }

  // TODO: Implement proper Twilio signature validation
  // For now, we'll skip if not configured
  console.log('Twilio signature validation skipped (not fully implemented)')
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Rate limit exceeded. Please try again later.</Message></Response>',
        {
          status: 429,
          headers: { 'Content-Type': 'application/xml' },
        }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string | null
    const numMedia = parseInt(formData.get('NumMedia') as string || '0', 10)
    const mediaUrl0 = formData.get('MediaUrl0') as string | null
    const mediaContentType0 = formData.get('MediaContentType0') as string | null

    if (!from) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Missing From field</Message></Response>',
        {
          status: 400,
          headers: { 'Content-Type': 'application/xml' },
        }
      )
    }

    // Normalize phone number
    const phoneNormalized = normalizePhoneNumber(from.replace('whatsapp:', ''))
    const normalizedPhone = phoneNormalized.isValid ? phoneNormalized.normalized : from.replace('whatsapp:', '')

    // Create intake record using Prisma
    let intake
    try {
      intake = await db.farmerIntake.create({
        data: {
          channel: 'whatsapp',
          fromPhone: normalizedPhone,
          messageText: body || null,
          mediaUrl: mediaUrl0 || null,
          mediaContentType: mediaContentType0 || null,
          status: 'received',
        },
      })
    } catch (intakeError: any) {
      console.error('Error creating intake record:', intakeError)
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your message. We received it and will contact you soon.</Message></Response>',
        {
          status: 200,
          headers: { 'Content-Type': 'application/xml' },
        }
      )
    }

    // Handle voice note (audio media)
    if (numMedia > 0 && mediaUrl0 && mediaContentType0?.startsWith('audio/')) {
      try {
        // Download audio using Twilio auth
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN

        if (!accountSid || !authToken) {
          throw new Error('Twilio credentials not configured')
        }

        const audioResponse = await fetch(mediaUrl0, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          },
        })

        if (!audioResponse.ok) {
          throw new Error(`Failed to download audio: ${audioResponse.status}`)
        }

        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())

        // Transcribe audio
        const transcription = await transcribeAudio(audioBuffer, mediaContentType0)

        if (!transcription.success || !transcription.transcript) {
          // Update intake with error using Prisma
          await db.farmerIntake.update({
            where: { id: intake.id },
            data: {
              status: 'failed',
              error: transcription.error || 'Transcription failed',
            },
          })

          // Reply to farmer
          const replyMessage = transcription.error?.includes('not configured')
            ? "We received your voice note but transcription is not available yet. We will still call you soon. Thank you!"
            : "We received your voice note but couldn't process it. We will call you soon. Thank you!"

          await sendWhatsAppMessage(normalizedPhone, replyMessage)

          return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`,
            {
              status: 200,
              headers: { 'Content-Type': 'application/xml' },
            }
          )
        }

        const transcript = transcription.transcript

        // Update intake with transcript using Prisma
        await db.farmerIntake.update({
          where: { id: intake.id },
          data: {
            transcript,
            status: 'transcribed',
          },
        })

        // Extract fields
        const extractedFields = await extractFarmerFields(transcript, normalizedPhone)

        // Create farmer record
        const farmerName = extractedFields.name || 'Unknown'
        const { data: farmer, error: farmerError } = await supabaseAdmin
          .from('farmers_applications')
          .insert({
            name: farmerName,
            phone: normalizedPhone,
            parish: extractedFields.parish || null,
            acres: extractedFields.acres || null,
            crops: extractedFields.crops || null,
            status: 'new',
            voice_ready: true,
            transcript,
            intake_channel: 'whatsapp',
            intake_source: 'voice',
          })
          .select()
          .single()

        if (farmerError) {
          console.error('Error creating farmer record:', farmerError)
          await supabaseAdmin
            .from('farmer_intakes')
            .update({
              status: 'failed',
              error: farmerError.message,
            })
            .eq('id', intake.id)

          await sendWhatsAppMessage(
            normalizedPhone,
            "Thank you for your voice note. We received it and will contact you soon."
          )

          return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your voice note. We received it and will contact you soon.</Message></Response>',
            {
              status: 200,
              headers: { 'Content-Type': 'application/xml' },
            }
          )
        }

        // Update intake with farmer_id and extracted_json using Prisma
        await db.farmerIntake.update({
          where: { id: intake.id },
          data: {
            farmerId: farmer.id,
            extractedJson: extractedFields,
            status: 'saved',
          },
        })

        // Notify coordinators via SMS (with VOICE NOTE marker)
        const coordinatorMessage = `🎙️ VOICE NOTE: New farmer joined: ${farmerName}${extractedFields.parish ? ` from ${extractedFields.parish}` : ''}. Phone: ${normalizedPhone}. Crops: ${extractedFields.crops || 'Not specified'}. Acres: ${extractedFields.acres || 'Not specified'}`
        const coordinators = [
          process.env.COORDINATOR_SHAMAINE_PHONE,
          process.env.COORDINATOR_SUZETTE_PHONE,
        ].filter(Boolean) as string[]

        if (coordinators.length > 0) {
          const { sendSMS } = await import('@/lib/twilio')
          await Promise.all(
            coordinators.map(coordinatorPhone => sendSMS({ to: coordinatorPhone, body: coordinatorMessage }))
          ).catch(error => {
            console.error('Failed to send coordinator SMS:', error)
          })
        }

        // Reply to farmer
        const replyMessage = `Thank you ${farmerName}! We received your voice note and will call you soon to connect your farm to chefs and markets. 🇯🇲🌱`
        await sendWhatsAppMessage(normalizedPhone, replyMessage)

        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`,
          {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
          }
        )
      } catch (error: any) {
        console.error('Error processing voice note:', error)
        await supabaseAdmin
          .from('farmer_intakes')
          .update({
            status: 'failed',
            error: error.message || 'Processing error',
          })
          .eq('id', intake.id)

        await sendWhatsAppMessage(
          normalizedPhone,
          "We received your message but encountered an error. We will call you soon. Thank you!"
        )

        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message>We received your message but encountered an error. We will call you soon. Thank you!</Message></Response>',
          {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
          }
        )
      }
    }

    // Handle text message
    if (body && body.trim().length > 0) {
      try {
        // Create minimal farmer record
        const { data: farmer, error: farmerError } = await supabaseAdmin
          .from('farmers_applications')
          .insert({
            name: 'Pending',
            phone: normalizedPhone,
            status: 'new',
            voice_ready: false,
            intake_channel: 'whatsapp',
            intake_source: 'text',
          })
          .select()
          .single()

        if (farmerError) {
          console.error('Error creating farmer from text:', farmerError)
        } else {
          // Update intake with farmer_id using Prisma
          await db.farmerIntake.update({
            where: { id: intake.id },
            data: {
              farmerId: farmer.id,
              status: 'saved',
            },
          })

          // Notify coordinators
          await sendCoordinatorNotificationSMS(
            'Pending',
            null,
            normalizedPhone,
            null,
            null
          ).catch(error => {
            console.error('Failed to send coordinator SMS:', error)
          })
        }

        // Reply asking for more info
        const replyMessage = `Thank you for your interest! Please send us:\n\n• Your full name\n• Your parish\n• What you grow\n• How many acres\n\nOr send a voice note with this information. We'll call you soon! 🇯🇲🌱`
        await sendWhatsAppMessage(normalizedPhone, replyMessage)

        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`,
          {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
          }
        )
      } catch (error: any) {
        console.error('Error processing text message:', error)
        await sendWhatsAppMessage(
          normalizedPhone,
          "Thank you for your message. We received it and will contact you soon."
        )

        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your message. We received it and will contact you soon.</Message></Response>',
          {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
          }
        )
      }
    }

    // Default response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your message. We received it and will contact you soon.</Message></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      }
    )
  } catch (error: any) {
    console.error('Error in WhatsApp webhook:', error)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your message. We received it and will contact you soon.</Message></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      }
    )
  }
}
