/**
 * Canonical booking / ops notification inbox (see docs/EMAIL_ROLES.md).
 * `ADMIN_EMAIL` is the source of truth — not `ADMIN_EMAILS` (magic-link allowlist).
 */
const FALLBACK_BOOKING_NOTIFICATION_EMAIL = 'bookings@bornfidis.com'

/** Default Reply-To when `RESEND_REPLY_TO` is unset. */
export const DEFAULT_PLATFORM_REPLY_TO = 'hello@bornfidis.com'

export function bookingNotificationRecipient(): string {
  const first = process.env.ADMIN_EMAIL?.split(',')[0]?.trim()
  if (first?.includes('@')) return first
  return FALLBACK_BOOKING_NOTIFICATION_EMAIL
}

/** Resend `reply_to` field — env first, then public inbox default. */
export function transactionalReplyToPayload(): { reply_to: string } {
  const r = process.env.RESEND_REPLY_TO?.trim()
  return { reply_to: r?.includes('@') ? r : DEFAULT_PLATFORM_REPLY_TO }
}
