import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyChefPrepReminder } from '@/lib/web-push-helper'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 2AK — Prep due reminder (T-24h). Run once daily; send push to chefs with event in ~24h.
 * GET /api/cron/prep-reminders
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const bookings = await db.bookingInquiry.findMany({
    where: {
      eventDate: tomorrow,
      status: { notIn: ['Cancelled', 'Canceled'] },
      assignedChefId: { not: null },
      jobCompletedAt: null,
      chefAssignment: {
        status: { in: ['ASSIGNED', 'CONFIRMED'] },
      },
    },
    select: {
      id: true,
      name: true,
      assignedChefId: true,
    },
  })

  const results: { bookingId: string; chefId: string; sent: boolean }[] = []
  for (const b of bookings) {
    if (!b.assignedChefId) continue
    try {
      await notifyChefPrepReminder(b.assignedChefId, b.name, b.id)
      trySmsFallbackPrepReminder(b.assignedChefId, b.id).catch(() => {})
      results.push({ bookingId: b.id, chefId: b.assignedChefId, sent: true })
    } catch {
      results.push({ bookingId: b.id, chefId: b.assignedChefId, sent: false })
    }
  }

  return NextResponse.json({
    ok: true,
    remindersSent: results.filter((r) => r.sent).length,
    results,
  })
}
