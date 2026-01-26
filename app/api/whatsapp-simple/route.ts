import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * SIMPLE WhatsApp webhook - Uses Prisma Client
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const from = formData.get('From')?.toString() || ''
    const body = formData.get('Body')?.toString() || ''
    
    console.log('📲 WhatsApp message received:', { from, body: body.substring(0, 50) })
    
    // Extract phone number (remove whatsapp: prefix, keep +)
    const phoneNumber = from.replace('whatsapp:', '')
    
    // Try to insert into whatsapp_messages table using Prisma
    try {
      const whatsappMessage = await db.whatsAppMessage.create({
        data: {
          phoneNumber,
          messageText: body,
        },
      })
      
      console.log('✅ Saved to whatsapp_messages:', whatsappMessage.id)
    } catch (whatsappError: any) {
      // If whatsapp_messages table doesn't exist, try farmer_intakes
      if (whatsappError.message?.includes('does not exist') || whatsappError.code === 'P2021') {
        console.log('⚠️ whatsapp_messages table not found, trying farmer_intakes...')
        
        try {
          const intake = await db.farmerIntake.create({
            data: {
              channel: 'whatsapp',
              fromPhone: phoneNumber,
              messageText: body,
              status: 'received',
            },
          })
          
          console.log('✅ Saved to farmer_intakes:', intake.id)
        } catch (intakeError: any) {
          console.error('❌ Both tables failed:', intakeError)
          return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Message>Thank you! We received your message. Our system is being updated.</Message>
            </Response>`,
            { 
              status: 200,
              headers: { 'Content-Type': 'text/xml' } 
            }
          )
        }
      } else {
        console.error('❌ Prisma insert error:', whatsappError)
      }
    }
    
    // Always return success to Twilio (don't let user know if there's an error)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Blessings from Bornfidis 🌿 Thank you for reaching out. We will contact you soon.</Message>
      </Response>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/xml' } 
      }
    )
  } catch (error: any) {
    console.error('❌ WhatsApp webhook error:', error)
    
    // Still return success to Twilio
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Thank you for your message. We'll get back to you soon.</Message>
      </Response>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/xml' } 
      }
    )
  }
}
