/**
 * Phase 2AK — Web Push (PWA) helper.
 * Send push notifications to chefs and admins. Fail-soft; respect quiet hours.
 */

import webPush from 'web-push'
import { db } from '@/lib/db'
import { isQuietHours } from '@/lib/sla'
import { getAdminEmails, getOpsLeadEmail } from '@/lib/sla'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const PUSH_ENABLED = !!VAPID_PUBLIC && !!VAPID_PRIVATE

if (PUSH_ENABLED) {
  webPush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'noreply@bornfidis.com'),
    VAPID_PUBLIC!,
    VAPID_PRIVATE!
  )
}

export type PushPayload = {
  title: string
  body?: string
  url?: string
  tag?: string // optional; use for de-dup / replace (e.g. "sla-booking-{id}")
}

/**
 * Send push to all subscriptions for a user. Non-blocking; errors logged only.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!PUSH_ENABLED) return { sent: 0, failed: 0 }
  const subs = await db.pushSubscription.findMany({ where: { userId } })
  let sent = 0
  let failed = 0
  for (const sub of subs) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 }
      )
      sent++
    } catch (e: unknown) {
      failed++
      const err = e as { statusCode?: number }
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      }
    }
  }
  return { sent, failed }
}

/**
 * Get user IDs for admin/staff who should receive admin alerts (by email match to users).
 */
async function getAdminUserIds(): Promise<string[]> {
  const emails = getAdminEmails()
  const opsLead = getOpsLeadEmail()
  const all = [...new Set([...emails, ...(opsLead ? [opsLead] : [])])]
  if (all.length === 0) return []
  const users = await db.user.findMany({
    where: { email: { in: all } },
    select: { id: true },
  })
  return users.map((u) => u.id)
}

/**
 * Send push to all admin/staff who have push subscribed. Respects quiet hours for non-urgent.
 */
export async function sendPushToAdmins(
  payload: PushPayload,
  options?: { skipQuietHours?: boolean }
): Promise<{ sent: number; failed: number }> {
  if (!PUSH_ENABLED) return { sent: 0, failed: 0 }
  if (!options?.skipQuietHours && isQuietHours()) return { sent: 0, failed: 0 }
  const userIds = await getAdminUserIds()
  let sent = 0
  let failed = 0
  for (const uid of userIds) {
    const r = await sendPushToUser(uid, payload)
    sent += r.sent
    failed += r.failed
  }
  return { sent, failed }
}

/**
 * Notify chef: new booking assigned.
 */
export async function notifyChefNewBooking(chefId: string, bookingName: string, bookingId: string): Promise<void> {
  await sendPushToUser(chefId, {
    title: 'New booking assigned',
    body: bookingName,
    url: `/chef/bookings/${bookingId}`,
    tag: `booking-assigned-${bookingId}`,
  })
}

/**
 * Notify chef: status needed (confirm or start prep).
 */
export async function notifyChefStatusNeeded(chefId: string, bookingName: string, bookingId: string): Promise<void> {
  await sendPushToUser(chefId, {
    title: 'Action needed',
    body: `Please confirm or start prep: ${bookingName}`,
    url: `/chef/bookings/${bookingId}`,
    tag: `status-needed-${bookingId}`,
  })
}

/**
 * Notify chef: prep due in 24h.
 */
export async function notifyChefPrepReminder(chefId: string, bookingName: string, bookingId: string): Promise<void> {
  if (isQuietHours()) return
  await sendPushToUser(chefId, {
    title: 'Prep due tomorrow',
    body: bookingName,
    url: `/chef/bookings/${bookingId}`,
    tag: `prep-reminder-${bookingId}`,
  })
}

/**
 * Notify chef: booking details changed.
 */
export async function notifyChefBookingChanged(chefId: string, bookingName: string, bookingId: string): Promise<void> {
  await sendPushToUser(chefId, {
    title: 'Booking updated',
    body: bookingName,
    url: `/chef/bookings/${bookingId}`,
    tag: `booking-changed-${bookingId}`,
  })
}

/**
 * Notify admins: SLA at risk / breached (de-dup by tag; one per booking per type).
 */
export async function notifyAdminsSlaAtRisk(bookingId: string, bookingName: string, breachTypes: string[]): Promise<void> {
  await sendPushToAdmins(
    {
      title: 'SLA at risk',
      body: `${bookingName}: ${breachTypes.join(', ')}`,
      url: `/admin/bookings/${bookingId}`,
      tag: `sla-${bookingId}`,
    },
    { skipQuietHours: false }
  )
}

/**
 * Notify admins: assignment needed (no chef yet).
 */
export async function notifyAdminsAssignmentNeeded(bookingId: string, bookingName: string): Promise<void> {
  await sendPushToAdmins(
    {
      title: 'Assignment needed',
      body: bookingName,
      url: `/admin/bookings/${bookingId}`,
      tag: `assign-needed-${bookingId}`,
    },
    { skipQuietHours: false }
  )
}

/**
 * Notify admins: escalation (after window).
 */
export async function notifyAdminsEscalation(bookingId: string, bookingName: string): Promise<void> {
  await sendPushToAdmins(
    {
      title: 'SLA escalation',
      body: bookingName,
      url: `/admin/bookings/${bookingId}`,
      tag: `sla-escalation-${bookingId}`,
    },
    { skipQuietHours: true }
  )
}

export { PUSH_ENABLED }
