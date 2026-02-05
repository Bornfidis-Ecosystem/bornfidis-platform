/**
 * Phase 2AB — Chef calendar sync (iCal feed).
 * Long-lived, revocable token per chef. Read-only sync of confirmed bookings.
 */

import { randomBytes } from 'crypto'
import { db } from '@/lib/db'

const TOKEN_BYTES = 32

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

/**
 * Get or create a calendar token for the chef. Safe to call repeatedly.
 */
export async function getOrCreateCalendarToken(chefId: string): Promise<string> {
  const row = await db.chefCalendarToken.findUnique({
    where: { chefId },
    select: { token: true },
  })
  if (row) return row.token
  const token = generateToken()
  await db.chefCalendarToken.create({
    data: { chefId, token },
  })
  return token
}

/**
 * Regenerate token (invalidates previous link). Returns new token.
 */
export async function regenerateCalendarToken(chefId: string): Promise<string> {
  const token = generateToken()
  await db.chefCalendarToken.upsert({
    where: { chefId },
    create: { chefId, token },
    update: { token },
  })
  return token
}

/**
 * Resolve chef ID from calendar token. Returns null if invalid.
 */
export async function getChefIdFromCalendarToken(
  token: string
): Promise<string | null> {
  if (!token?.trim()) return null
  const row = await db.chefCalendarToken.findUnique({
    where: { token: token.trim() },
    select: { chefId: true },
  })
  return row?.chefId ?? null
}

export type IcalBooking = {
  id: string
  eventDate: Date
  eventTime: string | null
  location: string
  locationCity: string | null
  locationState: string | null
  notes: string | null
  specialRequests: string | null
}

/**
 * Confirmed bookings only (CONFIRMED, IN_PREP, COMPLETED) for iCal.
 * No client PII beyond what appears in the event (location, notes).
 */
export async function getConfirmedBookingsForIcal(
  chefId: string
): Promise<IcalBooking[]> {
  const assignments = await db.chefAssignment.findMany({
    where: {
      chefId,
      status: { in: ['CONFIRMED', 'IN_PREP', 'COMPLETED'] },
    },
    include: {
      booking: {
        select: {
          id: true,
          eventDate: true,
          eventTime: true,
          location: true,
          locationCity: true,
          locationState: true,
          notes: true,
          specialRequests: true,
        },
      },
    },
  })
  return assignments.map((a) => ({
    id: a.booking.id,
    eventDate: a.booking.eventDate,
    eventTime: a.booking.eventTime,
    location: a.booking.location,
    locationCity: a.booking.locationCity,
    locationState: a.booking.locationState,
    notes: a.booking.notes,
    specialRequests: a.booking.specialRequests,
  }))
}

/**
 * Format date for iCal (UTC).
 */
function icalDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const s = String(d.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${day}T${h}${min}${s}Z`
}

/**
 * Escape text for iCal (CRLF, comma, semicolon, backslash).
 */
function icalEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Build start datetime from eventDate + eventTime (local date, optional time).
 */
function getStartDt(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const parts = eventTime.trim().split(':').map(Number)
    const h = parts[0] ?? 0
    const m = parts[1] ?? 0
    d.setHours(h, m, 0, 0)
  }
  return d
}

/**
 * Default event duration (3 hours) when no end time.
 */
const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000

/**
 * Generate iCal body for chef's confirmed bookings.
 */
export function buildIcalContent(bookings: IcalBooking[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bornfidis//Chef Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const b of bookings) {
    const startLocal = getStartDt(b.eventDate, b.eventTime)
    const endLocal = new Date(startLocal.getTime() + DEFAULT_DURATION_MS)
    const summary = 'Bornfidis Booking'
    const locationParts = [b.location]
    if (b.locationCity) locationParts.push(b.locationCity)
    if (b.locationState) locationParts.push(b.locationState)
    const location = locationParts.join(', ')
    const descParts: string[] = []
    if (b.notes) descParts.push(b.notes)
    if (b.specialRequests) descParts.push(b.specialRequests)
    const description = descParts.length ? icalEscape(descParts.join('\n')) : ''

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:bornfidis-booking-${b.id}@bornfidis`)
    lines.push(`DTSTAMP:${icalDate(new Date())}`)
    lines.push(`DTSTART:${icalDate(startLocal)}`)
    lines.push(`DTEND:${icalDate(endLocal)}`)
    lines.push(`SUMMARY:${icalEscape(summary)}`)
    if (location) lines.push(`LOCATION:${icalEscape(location)}`)
    if (description) lines.push(`DESCRIPTION:${description}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
