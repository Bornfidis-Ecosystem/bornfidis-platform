/**
 * Phase 3: WhatsApp Business API Helper
 * Uses Twilio WhatsApp Business API
 * Opt-in only, template-approved messaging
 */

import { sendWhatsAppMessage } from '@/lib/twilio'

/**
 * Send WhatsApp message via Twilio WhatsApp Business API
 * Format: whatsapp:+1234567890
 */
export async function sendWhatsApp(to: string, message: string): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  if (!process.env.TWILIO_WHATSAPP_NUMBER && !process.env.TWILIO_WHATSAPP_FROM) {
    console.warn('⚠️ WhatsApp not configured — skipped')
    return { success: false, error: 'WhatsApp not configured' }
  }

  try {
    const result = await sendWhatsAppMessage(to, message)
    return {
      success: result.success,
      messageSid: result.messageSid,
      error: result.error,
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error)
    return { success: false, error: error.message || 'Failed to send WhatsApp' }
  }
}
