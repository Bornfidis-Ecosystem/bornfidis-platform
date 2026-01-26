/**
 * Twilio Voice API Helper
 * Phase 11G.2: Voice Coordinator Engine
 */

interface InitiateCallOptions {
  to: string // Farmer phone number
  from: string // Coordinator/Twilio number
  farmerId: string
  coordinatorId?: string
  coordinatorPhone?: string // Coordinator's phone to connect after greeting
}

interface TwilioCallResponse {
  success: boolean
  callSid?: string
  error?: string
}

/**
 * Initiate a call to a farmer via Twilio Voice API
 */
export async function initiateFarmerCall(options: InitiateCallOptions): Promise<TwilioCallResponse> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio Voice: Missing credentials')
    return { success: false, error: 'Twilio not configured' }
  }

  // Generate TwiML URL for call flow
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
  const twimlUrl = `${baseUrl}/api/twilio/voice/greeting?farmer_id=${options.farmerId}${options.coordinatorPhone ? `&coordinator_phone=${encodeURIComponent(options.coordinatorPhone)}` : ''}`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          To: options.to,
          From: twilioPhoneNumber,
          Url: twimlUrl,
          Method: 'POST',
          StatusCallback: `${baseUrl}/api/twilio/voice/status`,
          StatusCallbackEvent: 'initiated,ringing,answered,completed',
          StatusCallbackMethod: 'POST',
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio Voice API error:', errorText)
      throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Call initiated successfully:', data.sid)
    return { success: true, callSid: data.sid }
  } catch (error: any) {
    console.error('Error initiating call:', error)
    return { success: false, error: error.message || 'Failed to initiate call' }
  }
}

/**
 * Generate TwiML for call greeting and coordinator connection
 */
export function generateCallTwiML(coordinatorPhone?: string): string {
  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    Hello, this is Bornfidis Portland. Thank you for joining our farmer network. A coordinator will speak with you now.
  </Say>`

  if (coordinatorPhone) {
    // Connect to coordinator
    twiml += `
  <Dial>
    <Number>${coordinatorPhone}</Number>
  </Dial>`
  } else {
    // If no coordinator phone, play message and end
    twiml += `
  <Say voice="alice" language="en-US">
    Please hold while we connect you to a coordinator.
  </Say>
  <Hangup/>`
  }

  twiml += `
</Response>`

  return twiml
}
