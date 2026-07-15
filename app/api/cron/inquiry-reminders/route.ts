import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'
import { sendInquiryStalenessReminderEmail } from '@/lib/email'
import { logEmailSend } from '@/lib/email-send-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Minimum age of inquiry before first automated nudge */
const STALE_MS = 3 * 24 * 60 * 60 * 1000
const MAX_PER_RUN = 25

function startOfTodayUtc(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

/**
 * Daily: new/reviewing inquiries with email, no reminder yet, created 3+ days ago, future event date.
 * Sets `inquiryReminderSentAt` and sends one Resend email per booking.
 * GET /api/cron/inquiry-reminders — Authorization: Bearer CRON_SECRET (or Vercel cron User-Agent).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const minCreated = new Date(Date.now() - STALE_MS)
  const today = startOfTodayUtc()

  try {
    const candidates = await db.bookingInquiry.findMany({
      where: {
        OR: [{ status: 'new_inquiry' }, { status: 'reviewing' }, { status: 'New' }],
        email: { not: null },
        NOT: { email: '' },
        inquiryReminderSentAt: null,
        createdAt: { lt: minCreated },
        eventDate: { gte: today },
      },
      take: MAX_PER_RUN,
      orderBy: { createdAt: 'asc' },
    })

    let sent = 0
    const errors: string[] = []

    for (const b of candidates) {
      const em = b.email?.trim()
      if (!em) continue
      try {
        const r = await sendInquiryStalenessReminderEmail(em, b.name, {
          eventDate: b.eventDate,
          eventLocation: b.location,
        })
        await logEmailSend({
          bookingId: b.id,
          templateType: 'inquiry_reminder',
          recipient: em,
          subject: "We're still with you — Bornfidis Provisions",
          success: r.success,
          error: r.error,
          actorName: 'Inquiry reminder cron',
        }).catch(() => {})
        if (!r.success) {
          errors.push(`${b.id}: ${r.error || 'email failed'}`)
          continue
        }
        await db.bookingInquiry.update({
          where: { id: b.id },
          data: { inquiryReminderSentAt: new Date() },
        })
        await db.bookingActivity.create({
          data: {
            bookingId: b.id,
            type: 'inquiry_reminder_sent',
            title: 'Inquiry reminder (automated)',
            description: 'Cron: stale inquiry nudge',
            actorName: 'System',
          },
        })
        sent++
      } catch (e: unknown) {
        errors.push(`${b.id}: ${e instanceof Error ? e.message : 'error'}`)
      }
    }

    return NextResponse.json({
      ok: true,
      candidates: candidates.length,
      sent,
      errors: errors.length ? errors : undefined,
    })
  } catch (e: unknown) {
    console.error('inquiry-reminders cron:', e)
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    )
  }
}
