/**
 * Phase 3: Notification Router
 * Routes messages to WhatsApp (preferred) or SMS (fallback)
 * Critical for long-term channel management
 *
 * Phase 2L: Chef booking status notifications (email + WhatsApp, fail-soft).
 */

import { sendSMS } from '@/lib/twilio'
import { sendWhatsApp } from '@/lib/whatsapp'
import { sendEmail } from '@/lib/email'
import type { ChefBookingStatus } from '@prisma/client'

interface NotifyClientOptions {
  phone: string
  prefersWhatsApp?: boolean
  message: string
}

/** Phase 2L: Chef + booking payload for status change notification */
export interface NotifyChefStatusChangeOptions {
  chef: { email?: string | null; phone?: string | null }
  booking: { name: string; eventDate: Date }
  status: ChefBookingStatus
}

const STATUS_SUBJECTS: Record<ChefBookingStatus, string> = {
  ASSIGNED: 'New Booking Assigned',
  CONFIRMED: 'Booking Confirmed',
  IN_PREP: 'Prep Started',
  COMPLETED: 'Job Completed',
}

/**
 * Phase 2L — Notify chef when booking status changes (ASSIGNED → CONFIRMED → IN_PREP → COMPLETED).
 * Sends email and/or WhatsApp; fail-soft: if one channel fails, the other still sends.
 * No admin copy in this phase; admin override = manual resend if needed.
 */
export async function notifyChefStatusChange({
  chef,
  booking,
  status,
}: NotifyChefStatusChangeOptions): Promise<void> {
  const eventDateStr = new Date(booking.eventDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const msg = `Booking ${booking.name} (${eventDateStr}): status updated to ${status.replace('_', ' ')}.`
  const subject = STATUS_SUBJECTS[status] ?? 'Booking Status Update'

  if (chef.email) {
    try {
      const result = await sendEmail({ to: chef.email, subject, text: msg })
      if (!result.success) console.warn('Phase 2L: Chef email failed:', result.error)
    } catch (e) {
      console.warn('Phase 2L: Chef email error:', e)
    }
  }

  if (chef.phone) {
    try {
      const result = await sendWhatsApp(chef.phone, msg)
      if (!result.success) console.warn('Phase 2L: Chef WhatsApp failed:', result.error)
    } catch (e) {
      console.warn('Phase 2L: Chef WhatsApp error:', e)
    }
  }
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
