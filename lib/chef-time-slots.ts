/**
 * Phase 2Y — Time-slot availability (within a day).
 * No overlapping slots per chef/day; day-level availability still respected; assignments block slot.
 */

import { db } from '@/lib/db'
import { checkChefAvailableForDate } from './chef-availability'

/** Time as minutes since midnight for comparison. */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function toDateOnly(d: Date): Date {
  const x = new Date(d)
  x.setUTCHours(0, 0, 0, 0)
  return x
}

export const SLOT_PRESETS = {
  Morning: { start: '09:00', end: '12:00' },
  Afternoon: { start: '12:00', end: '17:00' },
  Evening: { start: '17:00', end: '21:00' },
} as const

export type TimeSlotRow = {
  id: string
  chefId: string
  date: Date
  startTime: string
  endTime: string
  available: boolean
  createdAt: Date
}

/**
 * Get all time slots for a chef on a given day (date = YYYY-MM-DD or Date).
 */
export async function getTimeSlotsForChefDay(
  chefId: string,
  date: string | Date
): Promise<TimeSlotRow[]> {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00.000Z') : toDateOnly(date)
  const slots = await db.chefTimeSlot.findMany({
    where: { chefId, date: d },
    orderBy: [{ startTime: 'asc' }],
  })
  return slots
}

/**
 * Check if two time ranges overlap (same day, minute comparison).
 */
function slotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)
  return s1 < e2 && s2 < e1
}

/**
 * Add a time slot. Fails if it would overlap existing slots for that chef/day.
 */
export async function addTimeSlot(
  chefId: string,
  date: string | Date,
  startTime: string,
  endTime: string,
  available: boolean = true
): Promise<{ success: boolean; error?: string; id?: string }> {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00.000Z') : toDateOnly(date)
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return { success: false, error: 'Start time must be before end time' }
  }
  const existing = await getTimeSlotsForChefDay(chefId, d)
  for (const s of existing) {
    if (slotsOverlap(s.startTime, s.endTime, startTime, endTime)) {
      return { success: false, error: 'Overlaps with existing slot' }
    }
  }
  try {
    const slot = await db.chefTimeSlot.create({
      data: { chefId, date: d, startTime, endTime, available },
    })
    return { success: true, id: slot.id }
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to create slot' }
  }
}

/**
 * Update slot available flag or delete.
 */
export async function updateTimeSlot(
  slotId: string,
  available: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.chefTimeSlot.update({
      where: { id: slotId },
      data: { available },
    })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to update' }
  }
}

export async function deleteTimeSlot(slotId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.chefTimeSlot.delete({ where: { id: slotId } })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to delete' }
  }
}

/**
 * Check if a time (e.g. "14:00") falls within any available slot on the given date.
 * If chef has no slots for that day, returns allowed (backward compat).
 * Day-level availability is still enforced separately (checkChefAvailableForDate).
 */
export async function checkChefAvailableForDateTime(
  chefId: string,
  eventDate: Date,
  eventTime: string | null,
  options?: { adminOverride?: boolean }
): Promise<{ allowed: boolean; reason?: string }> {
  const dayCheck = await checkChefAvailableForDate(chefId, eventDate, options)
  if (!dayCheck.allowed) return dayCheck

  if (!eventTime || !eventTime.trim()) return { allowed: true }

  const slots = await getTimeSlotsForChefDay(chefId, eventDate)
  if (slots.length === 0) return { allowed: true }

  const timeStr = eventTime.trim().slice(0, 5)
  const minutes = timeToMinutes(timeStr)
  const inSlot = slots.some(
    (s) =>
      s.available &&
      timeToMinutes(s.startTime) <= minutes &&
      minutes < timeToMinutes(s.endTime)
  )
  if (!inSlot) {
    return { allowed: false, reason: 'Chef has no available time slot covering this time.' }
  }
  return { allowed: true }
}

/**
 * Get assignments for a chef on a date (for admin overlay: show bookings on the day).
 */
export async function getAssignmentsOnDay(chefId: string, date: string | Date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00.000Z') : toDateOnly(date)
  const dayEnd = new Date(d)
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)
  const assignments = await db.chefAssignment.findMany({
    where: {
      chefId,
      booking: { eventDate: { gte: d, lt: dayEnd } },
    },
    include: { booking: { select: { eventDate: true, eventTime: true, name: true } } },
  })
  return assignments
}
