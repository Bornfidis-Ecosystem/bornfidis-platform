import { db } from '@/lib/db'

/**
 * Phase 7+8 — Email send attempt logging for notification hardening.
 *
 * Writes to both `email_send_log` (Phase 8 admin UI) and `booking_activities`
 * (existing per-booking audit trail) when a bookingId is provided.
 */

export type EmailSendLogEntry = {
  division?: string
  bookingId?: string
  projectId?: string
  entityType?: string
  entityId?: string
  templateType: string
  recipient: string
  subject: string
  success: boolean
  error?: string
  actorName?: string
}

export async function logEmailSend(entry: EmailSendLogEntry): Promise<void> {
  try {
    await db.emailSendLog.create({
      data: {
        division: entry.division || 'provisions',
        templateType: entry.templateType,
        recipient: entry.recipient,
        subject: entry.subject,
        bookingId: entry.bookingId,
        projectId: entry.projectId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        status: entry.success ? 'sent' : 'failed',
        errorMessage: entry.error,
        actorName: entry.actorName || 'System',
      },
    }).catch(() => {})

    if (entry.bookingId) {
      await db.bookingActivity.create({
        data: {
          bookingId: entry.bookingId,
          type: `email_${entry.templateType}`,
          title: entry.success
            ? `Email sent: ${entry.templateType}`
            : `Email failed: ${entry.templateType}`,
          description: entry.success
            ? `To ${entry.recipient} — "${entry.subject}"`
            : `To ${entry.recipient} — ${entry.error || 'Unknown error'}`,
          actorName: entry.actorName || 'System',
        },
      }).catch(() => {})
    }

    if (!entry.success) {
      console.error(
        `[email-send-log] FAILED template=${entry.templateType} to=${entry.recipient} error=${entry.error}`,
      )
    }
  } catch (err) {
    console.error('[email-send-log] Could not write log:', err)
  }
}

/**
 * Get failed email count for dashboard Action Queue.
 */
export async function getFailedEmailCount(sinceDays = 7): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
    return await db.emailSendLog.count({
      where: { status: 'failed', sentAt: { gte: cutoff } },
    })
  } catch {
    return 0
  }
}

/**
 * Get recent email send logs for admin UI.
 */
export async function getEmailSendLogs(limit = 100): Promise<{
  id: string
  division: string
  templateType: string
  recipient: string
  subject: string
  status: string
  errorMessage: string | null
  attemptCount: number
  actorName: string | null
  bookingId: string | null
  projectId: string | null
  sentAt: Date
}[]> {
  try {
    return await db.emailSendLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: limit,
    })
  } catch {
    return []
  }
}

/**
 * Check if a booking email was already sent (dedup by booking + template type).
 */
export async function wasEmailSentRecently(
  bookingId: string,
  templateType: string,
  cooldownMs = 60 * 60 * 1000,
): Promise<boolean> {
  try {
    const cutoff = new Date(Date.now() - cooldownMs)
    const existing = await db.emailSendLog.findFirst({
      where: {
        bookingId,
        templateType,
        status: 'sent',
        sentAt: { gte: cutoff },
      },
      select: { id: true },
    })
    return !!existing
  } catch {
    return false
  }
}
