/**
 * Twilio SMS & WhatsApp Helper
 * Phase 11G.1: Messaging Service Support
 * Phase 11G.2: Follow-up SMS after calls
 * Phase 11G.3: WhatsApp integration
 */

interface SendSMSOptions {
  to: string
  body: string
  messagingServiceSid?: string
  from?: string
}

interface TwilioResponse {
  success: boolean
  messageSid?: string
  error?: string
}

/**
 * Send SMS via Twilio
 * Uses Messaging Service if configured, otherwise falls back to from number
 */
export async function sendSMS(options: SendSMSOptions): Promise<TwilioResponse> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  const fromNumber = process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER

  // Check if Twilio is configured
  if (!accountSid || !authToken) {
    console.log('Twilio not configured - skipping SMS')
    return { success: false, error: 'Twilio not configured' }
  }

  // Use Messaging Service if available, otherwise use from number
  if (!messagingServiceSid && !fromNumber) {
    console.error('Twilio: No Messaging Service SID or From Number configured')
    return { success: false, error: 'No Messaging Service SID or From Number configured' }
  }

  try {
    const body = new URLSearchParams({
      To: options.to,
      Body: options.body,
    })

    // Use Messaging Service if available (preferred)
    if (messagingServiceSid) {
      body.append('MessagingServiceSid', messagingServiceSid)
    } else if (fromNumber) {
      body.append('From', fromNumber)
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: body.toString(),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio API error:', errorText)
      throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('SMS sent successfully:', data.sid)
    return { success: true, messageSid: data.sid }
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    return { success: false, error: error.message || 'Failed to send SMS' }
  }
}

/**
 * Send SMS to farmer with welcome message
 */
export async function sendFarmerWelcomeSMS(phone: string, name: string): Promise<TwilioResponse> {
  const message = `Bornfidis Portland: Thank you for joining our farmer network. We will call you soon to connect your farm to chefs and markets. 🇯🇲🌱`
  return sendSMS({ to: phone, body: message })
}

/**
 * Send SMS to coordinators about new farmer
 */
export async function sendCoordinatorNotificationSMS(
  name: string,
  parish: string | null,
  phone: string,
  crops: string | null,
  acres: string | null
): Promise<TwilioResponse[]> {
  const coordinators = [
    process.env.COORDINATOR_SHAMAINE_PHONE,
    process.env.COORDINATOR_SUZETTE_PHONE,
  ].filter(Boolean) as string[]

  if (coordinators.length === 0) {
    console.warn('No coordinator phone numbers configured')
    return []
  }

  const message = `New farmer joined: ${name}${parish ? ` from ${parish}` : ''}. Phone: ${phone}. Crops: ${crops || 'Not specified'}. Acres: ${acres || 'Not specified'}`

  // Send to all coordinators
  const results = await Promise.all(
    coordinators.map(coordinatorPhone => sendSMS({ to: coordinatorPhone, body: message }))
  )

  return results
}

/**
 * Send WhatsApp message via Twilio WhatsApp API
 * Phase 11G.2: WhatsApp intake support (simple signature)
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<TwilioResponse> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || `whatsapp:${process.env.TWILIO_PHONE_NUMBER?.replace('+', '')}`

  if (!accountSid || !authToken) {
    console.log('Twilio not configured - skipping WhatsApp')
    return { success: false, error: 'Twilio not configured' }
  }

  // Format phone number for WhatsApp (whatsapp:+1234567890)
  const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.replace('+', '')}`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: whatsappFrom,
          To: whatsappTo,
          Body: body,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio WhatsApp API error:', errorText)
      throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('WhatsApp sent successfully:', data.sid)
    return { success: true, messageSid: data.sid }
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error)
    return { success: false, error: error.message || 'Failed to send WhatsApp' }
  }
}

/**
 * Send WhatsApp message via Twilio WhatsApp API
 * Phase 11G.3: WhatsApp coordinator hub (options signature)
 */
export async function sendWhatsApp(options: { to: string; body: string }): Promise<TwilioResponse> {
  return sendWhatsAppMessage(options.to, options.body)
}

/**
 * Send WhatsApp to coordinators about new farmer
 * Phase 11G.3: WhatsApp coordinator notifications
 */
export async function sendCoordinatorWhatsAppNotification(
  name: string,
  parish: string | null,
  phone: string,
  crops: string | null,
  acres: string | null
): Promise<TwilioResponse[]> {
  const coordinators = [
    process.env.COORDINATOR_SHAMAINE_WHATSAPP,
    process.env.COORDINATOR_SUZETTE_WHATSAPP,
  ].filter(Boolean) as string[]

  if (coordinators.length === 0) {
    console.warn('No coordinator WhatsApp numbers configured')
    return []
  }

  const message = `🌾 New farmer joined: ${name}${parish ? ` from ${parish}` : ''}\n📞 Phone: ${phone}\n🌱 Crops: ${crops || 'Not specified'}\n📏 Acres: ${acres || 'Not specified'}`

  // Send to all coordinators
  const results = await Promise.all(
    coordinators.map(coordinatorWhatsApp => sendWhatsAppMessage(coordinatorWhatsApp, message))
  )

  return results
}
