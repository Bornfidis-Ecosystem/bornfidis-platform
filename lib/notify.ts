/**
 * Phase 3: Notification Router
 * Routes messages to WhatsApp (preferred) or SMS (fallback)
 * Critical for long-term channel management
 */

import { sendSMS } from '@/lib/twilio'
import { sendWhatsApp } from '@/lib/whatsapp'

interface NotifyClientOptions {
  phone: string
  prefersWhatsApp?: boolean
  message: string
}

/**
 * Notify client via preferred channel
 * - If prefersWhatsApp is true → WhatsApp
 * - Otherwise → SMS (fallback)
 * 
 * This router ensures we respect user preferences
 * and can easily switch channels without changing business logic
 */
export async function notifyClient({
  phone,
  prefersWhatsApp = false,
  message,
}: NotifyClientOptions): Promise<{ success: boolean; channel: 'whatsapp' | 'sms'; error?: string }> {
  if (prefersWhatsApp) {
    const result = await sendWhatsApp(phone, message)
    return {
      success: result.success,
      channel: 'whatsapp',
      error: result.error,
    }
  } else {
    const result = await sendSMS({ to: phone, body: message })
    return {
      success: result.success,
      channel: 'sms',
      error: result.error,
    }
  }
}
