import { NextRequest, NextResponse } from 'next/server'
import { generateCallTwiML } from '@/lib/twilio-voice'

/**
 * Phase 11G.2: Twilio Voice Webhook - Call Greeting
 * GET/POST /api/twilio/voice/greeting
 * 
 * Returns TwiML for call greeting and coordinator connection
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const coordinatorPhone = searchParams.get('coordinator_phone')
  const farmerId = searchParams.get('farmer_id')

  // Generate TwiML
  const twiml = generateCallTwiML(coordinatorPhone || undefined)

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}

export async function POST(request: NextRequest) {
  // Twilio sends POST with call parameters
  const formData = await request.formData()
  const coordinatorPhone = formData.get('coordinator_phone')?.toString()
  const farmerId = formData.get('farmer_id')?.toString()

  // Generate TwiML
  const twiml = generateCallTwiML(coordinatorPhone || undefined)

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
