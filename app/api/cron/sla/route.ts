import { NextRequest, NextResponse } from 'next/server'
import {
  getOpenBookingsForSla,
  evaluateBookingSla,
  updateBookingSla,
  mergeBreachesWithAlerts,
  isQuietHours,
  wasAlertedRecently,
  getAdminEmails,
  getOpsLeadEmail,
  ESCALATION_WINDOW_HOURS,
  type SlaBreachEntry,
} from '@/lib/sla'
import { sendSlaAlertEmail, sendSlaEscalationEmail } from '@/lib/email'
import { notifyAdminsSlaAtRisk, notifyAdminsEscalation } from '@/lib/web-push-helper'
import { trySmsFallbackSlaAlert } from '@/lib/sms-fallback'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Phase 2AJ: SLA cron — run every 15 min. Evaluate open bookings, send alerts once per breach, escalate if unresolved.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quiet = isQuietHours()
  const adminEmails = getAdminEmails()
  const opsLead = getOpsLeadEmail()
  const results: { bookingId: string; status: string; alerted: boolean; escalated: boolean }[] = []

  const bookings = await getOpenBookingsForSla()

  for (const booking of bookings) {
    const evalResult = evaluateBookingSla(booking)
    const existingBreaches = (booking.slaBreaches as SlaBreachEntry[] | null) ?? []
    const now = new Date()
    let merged = mergeBreachesWithAlerts(existingBreaches, evalResult.breaches, now)
    const hasNewBreaches = evalResult.newBreaches.length > 0

    let alerted = false
    let escalated = false
    let slaAlertedAt: Date | undefined = booking.slaAlertedAt ?? undefined
    let slaEscalatedAt: Date | undefined = booking.slaEscalatedAt ?? undefined

    if (evalResult.status === 'breached') {
      if (hasNewBreaches && !quiet && adminEmails.length > 0) {
        const toSend = evalResult.newBreaches.filter((t) => !wasAlertedRecently(merged, t))
        if (toSend.length > 0) {
          for (const to of adminEmails) {
            const res = await sendSlaAlertEmail({
              to,
              bookingName: booking.name,
              bookingId: booking.id,
              breachTypes: toSend.map((t) => t.replace('_', ' ')),
              eventDate: new Date(booking.eventDate).toLocaleDateString('en-US'),
            })
            if (res.success) alerted = true
          }
          if (alerted) {
            slaAlertedAt = now
            merged = merged.map((b) =>
              toSend.includes(b.type) ? { ...b, alertedAt: now.toISOString() } : b
            )
            notifyAdminsSlaAtRisk(booking.id, booking.name, toSend.map((t) => t.replace('_', ' '))).catch(() => {})
            const adminUsers = await db.user.findMany({ where: { email: { in: adminEmails } }, select: { id: true } })
            for (const u of adminUsers) {
              trySmsFallbackSlaAlert(u.id, booking.id, false).catch(() => {})
            }
          }
        }
      }

      const alertedAt = slaAlertedAt ?? booking.slaAlertedAt
      const escalationDue =
        alertedAt && now.getTime() - new Date(alertedAt).getTime() > ESCALATION_WINDOW_HOURS * 60 * 60 * 1000
      if (escalationDue && !booking.slaEscalatedAt && !quiet) {
        const recipients = opsLead ? [opsLead] : adminEmails
        for (const to of recipients) {
          const res = await sendSlaEscalationEmail({
            to,
            bookingName: booking.name,
            bookingId: booking.id,
            breachTypes: evalResult.breaches.map((b) => b.type.replace('_', ' ')),
          })
          if (res.success) escalated = true
        }
        if (escalated) {
          slaEscalatedAt = now
          merged = merged.map((b) => ({ ...b, escalatedAt: now.toISOString() }))
          notifyAdminsEscalation(booking.id, booking.name).catch(() => {})
          const escalationEmails = opsLead ? [opsLead] : adminEmails
          const escalationUsers = await db.user.findMany({ where: { email: { in: escalationEmails } }, select: { id: true } })
          for (const u of escalationUsers) {
            trySmsFallbackSlaAlert(u.id, booking.id, true).catch(() => {})
          }
        }
      }
    }

    await updateBookingSla(booking.id, {
      slaStatus: evalResult.status,
      slaBreaches: merged,
      slaAlertedAt: slaAlertedAt ?? undefined,
      slaEscalatedAt: slaEscalatedAt ?? undefined,
    })

    results.push({
      bookingId: booking.id,
      status: evalResult.status,
      alerted,
      escalated,
    })
  }

  return NextResponse.json({
    ok: true,
    quietHours: quiet,
    bookingsChecked: bookings.length,
    results,
  })
}
