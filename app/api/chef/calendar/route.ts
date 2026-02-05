import { NextRequest, NextResponse } from 'next/server'
import {
  getChefIdFromCalendarToken,
  getConfirmedBookingsForIcal,
  buildIcalContent,
} from '@/lib/chef-calendar'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AB — iCal feed for chef bookings.
 * GET /api/chef/calendar?token=XYZ
 * Returns text/calendar with confirmed bookings only. Read-only; no client PII beyond location/notes.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const chefId = token ? await getChefIdFromCalendarToken(token) : null
  if (!chefId) {
    return NextResponse.json({ error: 'Invalid or missing token' }, { status: 401 })
  }

  const bookings = await getConfirmedBookingsForIcal(chefId)
  const ical = buildIcalContent(bookings)

  return new NextResponse(ical, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendar.ics"',
      'Cache-Control': 'private, max-age=300', // 5 min
    },
  })
}
