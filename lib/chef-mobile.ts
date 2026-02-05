/**
 * Phase 2AE — Mobile-first chef: data for home (next booking, earnings MTD).
 */

import { db } from '@/lib/db'
import { ChefBookingStatus } from '@prisma/client'

export type NextBooking = {
  assignmentId: string
  bookingId: string
  status: ChefBookingStatus
  name: string
  location: string
  eventDate: Date
  eventTime: string | null
}

/**
 * Next upcoming assignment (eventDate >= today, status not COMPLETED), by event date.
 */
export async function getNextUpcomingAssignment(
  chefId: string
): Promise<NextBooking | null> {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const a = await db.chefAssignment.findFirst({
    where: {
      chefId,
      status: { not: 'COMPLETED' },
      booking: { eventDate: { gte: today } },
    },
    orderBy: { booking: { eventDate: 'asc' } },
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          location: true,
          eventDate: true,
          eventTime: true,
        },
      },
    },
  })
  if (!a) return null
  return {
    assignmentId: a.id,
    bookingId: a.booking.id,
    status: a.status as ChefBookingStatus,
    name: a.booking.name,
    location: a.booking.location,
    eventDate: a.booking.eventDate,
    eventTime: a.booking.eventTime,
  }
}

/**
 * Sum of chefPayoutAmountCents for current calendar month (any status with payout set).
 */
export async function getChefEarningsMonthToDate(chefId: string): Promise<number> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const rows = await db.chefAssignment.findMany({
    where: {
      chefId,
      booking: {
        eventDate: { gte: start, lte: end },
        chefPayoutAmountCents: { not: null },
      },
    },
    select: { booking: { select: { chefPayoutAmountCents: true } } },
  })
  return rows.reduce((sum, r) => sum + (r.booking.chefPayoutAmountCents ?? 0), 0)
}
