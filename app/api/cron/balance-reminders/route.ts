import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'
import { sendEmail } from '@/lib/email'
import { formatUSD } from '@/lib/money'
import { createBalanceCheckoutSessionForBooking } from '@/lib/stripe-balance-checkout'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const REMINDER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000
/** Event date must fall within this many calendar days from today (inclusive). */
const EVENT_WINDOW_DAYS = 3

function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function addDaysUtc(d: Date, days: number): Date {
  const out = new Date(d)
  out.setUTCDate(out.getUTCDate() + days)
  return out
}

/**
 * Same balance math as `lib/stripe-balance-checkout.ts` / unified checkout.
 */
function remainingBalanceCents(b: {
  quoteTotalCents: number | null
  depositAmountCents: number | null
  balanceAmountCents: number | null
}): number {
  const total = b.quoteTotalCents ?? 0
  const depositRecorded = b.depositAmountCents ?? 0
  const stored = b.balanceAmountCents ?? 0
  if (total <= 0) return 0
  return stored > 0 ? stored : Math.max(total - depositRecorded, 0)
}

function depositPaid(b: { paidAt: Date | null; status: string }): boolean {
  return !!b.paidAt || String(b.status || '').toLowerCase() === 'booked'
}

/**
 * Daily: deposit paid, balance unpaid, quote total set, event in the next few days,
 * last reminder at least 7 days ago (or never). Sends client email with fresh Stripe balance link.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStart = startOfDayUtc(now)
  const windowEnd = addDaysUtc(todayStart, EVENT_WINDOW_DAYS)
  const cooldownCutoff = new Date(now.getTime() - REMINDER_COOLDOWN_MS)

  try {
    const rows = await db.bookingInquiry.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { quoteTotalCents: { gt: 0 } },
          { balancePaidAt: null },
          { jobCompletedAt: null },
          {
            status: {
              notIn: ['Cancelled', 'Canceled', 'cancelled', 'canceled', 'declined'],
            },
          },
          {
            eventDate: {
              gte: todayStart,
              lte: windowEnd,
            },
          },
          {
            OR: [
              { paidAt: { not: null } },
              { status: { equals: 'booked', mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { lastBalanceReminderSentAt: null },
              { lastBalanceReminderSentAt: { lt: cooldownCutoff } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        eventDate: true,
        eventTime: true,
        location: true,
        quoteTotalCents: true,
        depositAmountCents: true,
        balanceAmountCents: true,
        paidAt: true,
        status: true,
        balancePaidAt: true,
      },
    })

    let remindersSent = 0
    const skipped: Array<{ id: string; reason: string }> = []

    for (const booking of rows) {
      const email = booking.email?.trim()
      if (!email?.includes('@')) {
        skipped.push({ id: booking.id, reason: 'missing email' })
        continue
      }

      if (!depositPaid(booking)) {
        skipped.push({ id: booking.id, reason: 'deposit not recorded as paid' })
        continue
      }

      if (booking.balancePaidAt) {
        skipped.push({ id: booking.id, reason: 'balance already paid' })
        continue
      }

      const balanceCents = remainingBalanceCents(booking)
      if (balanceCents <= 0) {
        skipped.push({ id: booking.id, reason: 'no balance due' })
        continue
      }

      const session = await createBalanceCheckoutSessionForBooking(booking.id)
      if (!session.success) {
        skipped.push({ id: booking.id, reason: session.error })
        continue
      }

      const eventLabel = booking.eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
      const timePart = booking.eventTime?.trim() ? ` at ${booking.eventTime.trim()}` : ''
      const locationPart = booking.location?.trim() ? `\nLocation: ${booking.location.trim()}` : ''

      const text = `Hi ${booking.name.trim()},

This is a friendly reminder that the remaining balance for your Bornfidis private dining experience is ${formatUSD(balanceCents)}.

Event: ${eventLabel}${timePart}${locationPart}

When you're ready, complete your payment here (secure card checkout):
${session.url}

Questions? Just reply to this email.

— Bornfidis Provisions`

      const mail = await sendEmail({
        to: email,
        subject: 'Balance reminder — Bornfidis Provisions',
        text,
      })

      if (!mail.success) {
        skipped.push({ id: booking.id, reason: mail.error || 'email send failed' })
        continue
      }

      await db.bookingInquiry.update({
        where: { id: booking.id },
        data: { lastBalanceReminderSentAt: new Date() },
      })

      await db.bookingActivity.create({
        data: {
          bookingId: booking.id,
          type: 'balance_reminder_sent',
          title: 'Balance reminder email sent',
          description: `Cron: ${formatUSD(balanceCents)} due — client notified.`,
          actorName: 'Balance reminder cron',
        },
      })

      remindersSent += 1
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      candidates: rows.length,
      skipped,
    })
  } catch (e) {
    console.error('balance-reminders cron failed:', e)
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
