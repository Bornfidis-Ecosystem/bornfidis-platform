/**
 * Phase 2V — Chef availability (day-based).
 * Sync: availability overrides defaults; completed assignments mark day busy; admin can override.
 */

import { db } from '@/lib/db'

/** Normalize to date-only (UTC midnight) for comparison. */
function toDateKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Start/end of month in UTC for queries. */
function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  return { start, end }
}

export type DayAvailability = {
  date: string // YYYY-MM-DD
  available: boolean
  note: string | null
  /** True if chef has an assignment (any status) on this date — prevents double-book. */
  hasAssignment: boolean
}

/**
 * Get availability for a chef for a calendar month.
 * Returns one entry per day that has an explicit availability record or an assignment.
 * Days with no record are treated as "available" for display; you can merge with getBusyDatesFromAssignments.
 */
export async function getAvailabilityForChefMonth(
  chefId: string,
  year: number,
  month: number
): Promise<DayAvailability[]> {
  const { start, end } = monthBounds(year, month)
  const [records, assignments] = await Promise.all([
    db.chefAvailability.findMany({
      where: { chefId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    }),
    db.chefAssignment.findMany({
      where: { chefId },
      select: { booking: { select: { eventDate: true } } },
    }),
  ])
  const assignmentDates = new Set(
    assignments.map((a) => toDateKey(new Date(a.booking.eventDate)))
  )
  const byDate = new Map<string, DayAvailability>()
  for (const r of records) {
    const key = toDateKey(r.date)
    byDate.set(key, {
      date: key,
      available: r.available,
      note: r.note,
      hasAssignment: assignmentDates.has(key),
    })
  }
  // Add assignment-only days in this month (no explicit availability) so UI can show "busy"
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`
  for (const key of assignmentDates) {
    if (key.startsWith(monthPrefix) && !byDate.has(key)) {
      byDate.set(key, {
        date: key,
        available: false,
        note: null,
        hasAssignment: true,
      })
    }
  }
  const daysInMonth = new Date(year, month, 0).getDate()
  const result: DayAvailability[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const existing = byDate.get(key)
    if (existing) {
      result.push(existing)
    } else {
      result.push({ date: key, available: true, note: null, hasAssignment: false })
    }
  }
  return result
}

/**
 * Set availability for a single day. Creates or updates record.
 * Admin can override (same function; access control at route/action level).
 */
export async function setDayAvailability(
  chefId: string,
  date: Date,
  available: boolean,
  note?: string | null
): Promise<{ success: boolean; error?: string }> {
  const dateOnly = new Date(date)
  dateOnly.setUTCHours(0, 0, 0, 0)
  try {
    await db.chefAvailability.upsert({
      where: {
        chefId_date: { chefId, date: dateOnly },
      },
      create: { chefId, date: dateOnly, available, note: note ?? null },
      update: { available, note: note ?? null },
    })
    return { success: true }
  } catch (e: any) {
    console.error('setDayAvailability:', e)
    return { success: false, error: e.message || 'Failed to save' }
  }
}

/**
 * Check if chef can be assigned for a given event date.
 * Returns: { allowed, reason? }
 * - Block if chef has another assignment that day (double-book).
 * - Block if explicit availability for that day is false (unless admin override).
 * - Default (no record) = allowed.
 */
export async function checkChefAvailableForDate(
  chefId: string,
  eventDate: Date,
  options?: { adminOverride?: boolean }
): Promise<{ allowed: boolean; reason?: string }> {
  const key = toDateKey(eventDate)
  const dayStart = new Date(eventDate)
  dayStart.setUTCHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)
  const [existingAssignmentSameDay, availabilityRecord] = await Promise.all([
    db.chefAssignment.findFirst({
      where: {
        chefId,
        booking: { eventDate: { gte: dayStart, lt: dayEnd } },
      },
      select: { id: true, bookingId: true },
    }),
    db.chefAvailability.findUnique({
      where: {
        chefId_date: { chefId, date: new Date(key + 'T00:00:00.000Z') },
      },
    }),
  ])

  if (existingAssignmentSameDay) {
    return { allowed: false, reason: 'Chef already has an assignment on this date (double-booking).' }
  }
  if (availabilityRecord && !availabilityRecord.available && !options?.adminOverride) {
    return { allowed: false, reason: 'Chef is marked unavailable on this date.' }
  }
  return { allowed: true }
}

/**
 * Get dates in a month where chef has an assignment (for UI "busy" display).
 */
export async function getBusyDatesFromAssignments(
  chefId: string,
  year: number,
  month: number
): Promise<Set<string>> {
  const { start, end } = monthBounds(year, month)
  const assignments = await db.chefAssignment.findMany({
    where: {
      chefId,
      booking: { eventDate: { gte: start, lte: end } },
    },
    select: { booking: { select: { eventDate: true } } },
  })
  return new Set(assignments.map((a) => toDateKey(new Date(a.booking.eventDate))))
}
