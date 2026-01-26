import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseFarmerMessage, type ParsedFarmerMessage } from '@/lib/intakeParser'

/**
 * Phase 11G.2: WhatsApp Inbound Webhook
 * 
 * Handles incoming WhatsApp messages from Twilio with full parsing and profile creation:
 * 1. Creates FarmerIntake record (status: received)
 * 2. Parses message using parseFarmerMessage()
 * 3. Upserts Farmer by phone number
 * 4. Creates FarmerCrop records for parsed crops
 * 5. Updates FarmerIntake with parsed data and status
 * 6. Sends appropriate WhatsApp reply based on status
 */
export async function POST(request: NextRequest) {
  // 🔥 CRITICAL: Log immediately to confirm webhook is hit
  console.log('🔥 WhatsApp inbound webhook HIT at', new Date().toISOString())
  
  let intakeId: string | null = null
  let farmerId: string | null = null
  let replyMessage = 'Thank you for your message. We received it and will contact you soon.'

  try {
    // Parse Twilio's form-encoded body
    const formData = await request.formData()
    
    // Log all form data keys for debugging
    const allKeys = Array.from(formData.keys())
    console.log('📋 Form data keys received:', allKeys)
    
    const from = formData.get('From') as string
    const body = formData.get('Body') as string
    const messageSid = formData.get('MessageSid') as string
    const to = formData.get('To') as string

    console.log('📲 WhatsApp inbound payload:', { 
      from, 
      body: body ? body.substring(0, 50) + (body.length > 50 ? '...' : '') : null, 
      messageSid,
      to 
    })

    // Extract phone number (remove whatsapp: prefix if present)
    const phone = from?.replace('whatsapp:', '') || ''
    
    if (!phone) {
      console.warn('⚠️ Missing phone number in webhook payload. From field:', from)
      return createTwimlResponse(replyMessage)
    }

    console.log('📞 Extracted phone:', phone)

    // Step 1: Always create FarmerIntake record (status: received)
    console.log('💾 Step 1: Creating FarmerIntake record...')
    
    const intake = await db.farmerIntake.create({
      data: {
        channel: 'whatsapp',
        fromPhone: phone,
        messageText: body || null,
        status: 'received',
      },
    })

    intakeId = intake.id
    console.log('✅ FarmerIntake created:', intakeId)

    // Step 2: Parse the message
    console.log('🔍 Step 2: Parsing message...')
    const parsed: ParsedFarmerMessage = parseFarmerMessage(body || '')
    
    console.log('📊 Parsed result:', {
      name: parsed.name,
      parish: parsed.parish,
      acres: parsed.acres,
      cropsCount: parsed.crops.length,
      confidence: parsed.confidence,
      notes: parsed.notes,
    })

    // Step 3: Upsert Farmer by phone number
    console.log('👤 Step 3: Upserting Farmer by phone...')
    
    let farmer = await db.farmer.findUnique({
      where: { phone },
    })

    if (farmer) {
      // Update existing farmer if parser provides missing values
      const updateData: {
        name?: string
        parish?: string | null
        acres?: number | null
      } = {}

      // Update name if it's "Unknown Farmer" and parser found a name
      if ((farmer.name === 'Unknown Farmer' || !farmer.name) && parsed.name) {
        updateData.name = parsed.name
      }
      // Update parish if missing and parser found one
      if (!farmer.parish && parsed.parish) {
        updateData.parish = parsed.parish
      }
      // Update acres if missing and parser found one
      if (farmer.acres === null && parsed.acres !== null) {
        updateData.acres = parsed.acres
      }

      if (Object.keys(updateData).length > 0) {
        farmer = await db.farmer.update({
          where: { id: farmer.id },
          data: updateData,
        })
        console.log('✅ Updated existing Farmer:', farmer.id, updateData)
      } else {
        console.log('ℹ️ Farmer exists, no updates needed:', farmer.id)
      }
    } else {
      // Create new farmer
      farmer = await db.farmer.create({
        data: {
          phone,
          name: parsed.name || 'Unknown Farmer',
          parish: parsed.parish || null,
          acres: parsed.acres || null,
          language: 'en',
        },
      })
      console.log('✅ Created new Farmer:', farmer.id, { name: farmer.name })
    }

    farmerId = farmer.id

    // Step 4: Create FarmerCrop records for each parsed crop
    if (parsed.crops.length > 0) {
      console.log('🌾 Step 4: Creating FarmerCrop records...', parsed.crops)
      
      for (const crop of parsed.crops) {
        try {
          await db.farmerCrop.create({
            data: {
              farmerId: farmer.id,
              crop: crop,
            },
          })
          console.log('✅ Created FarmerCrop:', crop)
        } catch (cropError: any) {
          // Skip duplicates (unique constraint violation)
          if (cropError.code === 'P2002') {
            console.log('ℹ️ Crop already exists, skipping:', crop)
          } else {
            console.error('❌ Error creating FarmerCrop:', crop, cropError.message)
          }
        }
      }
    } else {
      console.log('ℹ️ No crops to create')
    }

    // Step 5: Update FarmerIntake with parsed data and status
    console.log('📝 Step 5: Updating FarmerIntake...')
    
    // Determine status based on farmer linking and data quality
    let status: 'parsed' | 'profile_created' | 'needs_review' = 'parsed'
    
    // If farmer was successfully linked, mark as profile_created
    if (farmerId) {
      // Check if we need review due to low confidence and missing data
      const hasLowQualityData = parsed.confidence === 'low' && 
                                 parsed.crops.length === 0 && 
                                 !parsed.parish && 
                                 !parsed.acres &&
                                 !parsed.name
      
      if (hasLowQualityData) {
        status = 'needs_review'
        console.log('⚠️ Low quality data detected, marking for review')
      } else {
        status = 'profile_created'
        console.log('✅ Good quality data, profile created')
      }
    } else {
      // No farmer linked (shouldn't happen, but handle edge case)
      if (parsed.confidence === 'low' && parsed.crops.length === 0 && !parsed.parish && !parsed.acres) {
        status = 'needs_review'
      }
    }

    await db.farmerIntake.update({
      where: { id: intakeId },
      data: {
        farmerId: farmerId,
        parsedJson: parsed as any, // Prisma Json type
        status: status,
      },
    })

    console.log('✅ Updated FarmerIntake:', {
      intakeId,
      farmerId,
      status,
    })

    // Step 6: Determine WhatsApp reply message
    if (status === 'profile_created') {
      replyMessage = 'Thank you! We\'ve created your profile. We\'ll contact you soon to discuss your farming needs.'
    } else if (status === 'needs_review') {
      replyMessage = 'Thanks for reaching out! To help us better, could you please share:\n1. Your name\n2. Your parish\n3. Your top 3 crops'
    } else {
      replyMessage = 'Thank you for your message. We received it and will contact you soon.'
    }

    console.log('💬 Reply message:', replyMessage)

  } catch (error: any) {
    // Log error but continue to return TwiML
    console.error('❌ Error processing WhatsApp message:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      intakeId,
      farmerId,
    })

    // If we created an intake but failed later, try to update it with error
    if (intakeId) {
      try {
        await db.farmerIntake.update({
          where: { id: intakeId },
          data: {
            error: error.message || 'Unknown error',
            status: 'needs_review',
          },
        })
        console.log('✅ Updated FarmerIntake with error:', intakeId)
      } catch (updateError: any) {
        console.error('❌ Failed to update FarmerIntake with error:', updateError.message)
      }
    }

    // Use default reply message on error
    replyMessage = 'Thank you for your message. We\'ll get back to you soon.'
  }

  // Step 7: Always return valid TwiML response
  console.log('📤 Returning TwiML response')
  return createTwimlResponse(replyMessage)
}

/**
 * Helper function to create TwiML XML response
 */
function createTwimlResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}

/**
 * Escape XML special characters for TwiML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
