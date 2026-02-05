/**
 * Phase 2AM — SMS fallback for critical messages when push/email fail or are not enabled.
 * Delivery order: Push → Email → SMS. One message per event. Quiet hours and rate limit respected.
 */

import { db } from '@/lib/db'
import { sendSMS } from '@/lib/twilio'
import { isQuietHours } from '@/lib/sla'
import { normalizePhoneNumber } from '@/lib/phone-normalize'

const MAX_SMS_PER_USER_PER_DAY = Number(process.env.SMS_FALLBACK_MAX_PER_DAY) || 5
const SMS_FALLBACK_ENABLED = process.env.SMS_FALLBACK_ENABLED !== 'false'

export type CriticalEventType =
  | 'booking_assigned'
  | 'booking_changed'
  | 'prep_reminder'
  | 'sla_breach'
  | 'sla_escalation'
  | 'same_day_cancellation'

/** Get phone for user: PartnerProfile.phone (chefs) or User.phone. */
export async function getPhoneForUser(userId: string): Promise<string | null> {
  const profile = await db.partnerProfile.findUnique({
    where: { userId },
    select: { phone: true },
  })
  if (profile?.phone?.trim()) {
    const r = normalizePhoneNumber(profile.phone)
    if (r.isValid && r.normalized) return r.normalized
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  })
  if (user?.phone?.trim()) {
    const r = normalizePhoneNumber(user.phone)
    if (r.isValid && r.normalized) return r.normalized
  }
  return null
}

/** Check if we already sent SMS for this event (dedup). */
async function alreadySent(userId: string, eventKey: string): Promise<boolean> {
  const existing = await db.smsDeliveryLog.findUnique({
    where: { userId_eventKey: { userId, eventKey } },
  })
  return !!existing
}

/** Count SMS sent today for user (rate limit). */
async function countSentToday(userId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const count = await db.smsDeliveryLog.count({
    where: { userId, sentAt: { gte: startOfDay } },
  })
  return count
}

/** Build short plain message (no links). */
function buildMessage(eventType: CriticalEventType, shortRef: string): string {
  const prefix = 'Bornfidis:'
  switch (eventType) {
    case 'booking_assigned':
      return `${prefix} Booking ${shortRef} assigned to you. Action needed. Open the app.`
    case 'booking_changed':
      return `${prefix} Booking ${shortRef} was updated. Open the app.`
    case 'prep_reminder':
      return `${prefix} Prep due soon for booking ${shortRef}. Open the app.`
    case 'sla_breach':
      return `${prefix} SLA alert for booking ${shortRef}. Open the app.`
    case 'sla_escalation':
      return `${prefix} SLA escalation for booking ${shortRef}. Open the app.`
    case 'same_day_cancellation':
      return `${prefix} Same-day change for booking ${shortRef}. Open the app.`
    default:
      return `${prefix} Action required. Open the app.`
  }
}

/** Twilio permanent failure codes: disable SMS for user. */
const PERMANENT_FAILURE_CODES = new Set([
  21211, // Invalid 'To' Phone Number
  21610, // Attempt to send to unsubscribed recipient
  21614, // 'To' number is not a valid mobile number
  30003, // Unreachable destination
  30005, // Unknown destination
  30006, // Landline
])

/**
 * Send critical SMS fallback. Checks: enabled, smsEnabled, phone, quiet hours, rate limit, dedup.
 * One message per event (eventKey). On permanent Twilio failure, sets user.smsEnabled = false.
 */
export async function sendCriticalSmsFallback(
  userId: string,
  eventType: CriticalEventType,
  eventKey: string,
  shortRef: string
): Promise<{ sent: boolean; error?: string }> {
  if (!SMS_FALLBACK_ENABLED) return { sent: false, error: 'SMS fallback disabled' }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { smsEnabled: true },
  })
  if (!user?.smsEnabled) return { sent: false, error: 'SMS disabled for user' }

  const phone = await getPhoneForUser(userId)
  if (!phone) return { sent: false, error: 'No phone for user' }

  if (isQuietHours()) return { sent: false, error: 'Quiet hours' }

  if (await alreadySent(userId, eventKey)) return { sent: false, error: 'Duplicate event' }

  const todayCount = await countSentToday(userId)
  if (todayCount >= MAX_SMS_PER_USER_PER_DAY) return { sent: false, error: 'Rate limit' }

  const body = buildMessage(eventType, shortRef)
  const result = await sendSMS({ to: phone, body })

  if (result.success) {
    await db.smsDeliveryLog.create({ data: { userId, eventKey } }).catch(() => {})
    return { sent: true }
  }

  const errMsg = result.error || ''
  const codeMatch = errMsg.match(/\/ (2\d{4}|3\d{4}) /)
  const code = codeMatch ? parseInt(codeMatch[1], 10) : null
  if (code != null && PERMANENT_FAILURE_CODES.has(code)) {
    await db.user.update({ where: { id: userId }, data: { smsEnabled: false } }).catch(() => {})
  }
  return { sent: false, error: errMsg }
}

/**
 * Try SMS fallback for booking-assigned (call after push; one per event).
 */
export async function trySmsFallbackBookingAssigned(chefId: string, bookingId: string): Promise<void> {
  const shortRef = `#${bookingId.slice(0, 8)}`
  await sendCriticalSmsFallback(chefId, 'booking_assigned', `booking-${bookingId}-assigned`, shortRef).catch(() => {})
}

/**
 * Try SMS fallback for prep reminder (T-24h).
 */
export async function trySmsFallbackPrepReminder(chefId: string, bookingId: string): Promise<void> {
  const shortRef = `#${bookingId.slice(0, 8)}`
  await sendCriticalSmsFallback(chefId, 'prep_reminder', `booking-${bookingId}-prep-reminder`, shortRef).catch(() => {})
}

/**
 * Try SMS fallback for SLA breach/escalation to admins (by userId).
 */
export async function trySmsFallbackSlaAlert(userId: string, bookingId: string, isEscalation: boolean): Promise<void> {
  const shortRef = `#${bookingId.slice(0, 8)}`
  const eventKey = `sla-${bookingId}-${isEscalation ? 'escalation' : 'breach'}`
  await sendCriticalSmsFallback(
    userId,
    isEscalation ? 'sla_escalation' : 'sla_breach',
    eventKey,
    shortRef
  ).catch(() => {})
}

/**
 * Try SMS fallback for same-day cancellation (e.g. to assigned chef).
 */
export async function trySmsFallbackSameDayCancellation(userId: string, bookingId: string): Promise<void> {
  const shortRef = `#${bookingId.slice(0, 8)}`
  await sendCriticalSmsFallback(
    userId,
    'same_day_cancellation',
    `booking-${bookingId}-same-day-cancel`,
    shortRef
  ).catch(() => {})
}

/**
 * Try SMS fallback for booking changed (to assigned chef).
 */
export async function trySmsFallbackBookingChanged(chefId: string, bookingId: string): Promise<void> {
  const shortRef = `#${bookingId.slice(0, 8)}`
  await sendCriticalSmsFallback(chefId, 'booking_changed', `booking-${bookingId}-changed`, shortRef).catch(() => {})
}
