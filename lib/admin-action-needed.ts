import { db } from '@/lib/db'
import { getFailedEmailCount } from '@/lib/email-send-log'
import {
  BOOKING_STATUS_GROUPS,
  normalizeBookingStatus,
  statusMatchesGroup,
} from '@/lib/booking-pipeline-status'

export type ActionNeededItem = {
  id: string
  name: string
  status: string
  /** ISO string — safe to pass from Server Components into client components. */
  eventDate: string
  eventType?: string | null
}

export type AdminActionNeeded = {
  /** New / reviewing leads that still need a response. */
  newLeads: ActionNeededItem[]
  depositFollowUps: ActionNeededItem[]
  upcomingPrep: ActionNeededItem[]
  finalBalanceReminders: ActionNeededItem[]
  postEventFollowUps: ActionNeededItem[]
  /** Phase 8: overdue prep tasks from BookingPrepItem rows. */
  overduePrepTasks: ActionNeededItem[]
  /** Phase 8: failed emails in last 7 days. */
  failedEmailCount: number
  /** Phase 8: Digital Studio applications awaiting review. */
  dsApplicationsPending: number
  /** Phase 8: DS projects awaiting client input. */
  dsProjectsAwaitingInput: number
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function dayDiff(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

function toItem(b: {
  id: string
  name: string
  status: string
  eventDate: string
  eventType?: string | null
}): ActionNeededItem {
  return {
    id: b.id,
    name: b.name,
    status: b.status,
    eventDate: b.eventDate,
    eventType: b.eventType,
  }
}

/** Quote-sent / awaiting-deposit, plus legacy "Booked" still unpaid. */
function needsDepositFollowUp(status: string, paidAt: Date | null): boolean {
  if (paidAt) return false
  if (statusMatchesGroup(status, BOOKING_STATUS_GROUPS.quoteSentLike)) return true
  return normalizeBookingStatus(status) === 'booked'
}

export async function getAdminActionNeeded(): Promise<AdminActionNeeded> {
  const today = startOfDay(new Date())
  const lookbackStart = addDays(today, -3)
  const lookaheadEnd = addDays(today, 14)

  // Broad date window; classify by canonical + legacy status groups in memory
  // so quote_sent / confirmed / new_inquiry are not missed by legacy Quoted/Booked filters.
  const [bookings, failedEmailCount, dsAppCount, dsAwaitingCount] = await Promise.all([
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: lookbackStart, lte: lookaheadEnd },
      },
      select: {
        id: true,
        name: true,
        status: true,
        eventDate: true,
        eventType: true,
        paidAt: true,
        balancePaidAt: true,
        prepItems: {
          where: {
            status: { notIn: ['completed', 'cancelled'] },
            dueAt: { lt: new Date() },
          },
          select: { id: true },
        },
      },
      orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }],
    }),
    getFailedEmailCount(7),
    db.digitalStudioApplication.count({
      where: { status: { in: ['new', 'reviewing'] } },
    }).catch(() => 0),
    db.digitalStudioProject.count({
      where: { status: 'client_review' },
    }).catch(() => 0),
  ])

  const base = bookings
    .filter((b) => !statusMatchesGroup(b.status, BOOKING_STATUS_GROUPS.cancelledLike))
    .map((b) => ({
      id: b.id,
      name: b.name,
      status: b.status,
      eventDate: b.eventDate.toISOString(),
      eventType: b.eventType,
      paidAt: b.paidAt,
      balancePaidAt: b.balancePaidAt,
      daysFromToday: dayDiff(today, b.eventDate),
      overdueTaskCount: b.prepItems.length,
    }))

  const newLeads = base
    .filter(
      (b) =>
        statusMatchesGroup(b.status, BOOKING_STATUS_GROUPS.newLike) &&
        b.daysFromToday >= 0 &&
        b.daysFromToday <= 14
    )
    .map(toItem)

  const depositFollowUps = base
    .filter(
      (b) =>
        needsDepositFollowUp(b.status, b.paidAt) &&
        b.daysFromToday >= 0 &&
        b.daysFromToday <= 14
    )
    .map(toItem)

  const upcomingPrep = base
    .filter(
      (b) =>
        statusMatchesGroup(b.status, BOOKING_STATUS_GROUPS.confirmedLike) &&
        b.daysFromToday >= 0 &&
        b.daysFromToday <= 3
    )
    .map(toItem)

  const finalBalanceReminders = base
    .filter(
      (b) =>
        statusMatchesGroup(b.status, BOOKING_STATUS_GROUPS.confirmedLike) &&
        b.daysFromToday >= 0 &&
        b.daysFromToday <= 2 &&
        !b.balancePaidAt
    )
    .map(toItem)

  const postEventFollowUps = base
    .filter(
      (b) =>
        statusMatchesGroup(b.status, BOOKING_STATUS_GROUPS.completedLike) &&
        b.daysFromToday >= -3 &&
        b.daysFromToday <= -1
    )
    .map(toItem)

  const overduePrepTasks = base
    .filter((b) => b.overdueTaskCount > 0 && b.daysFromToday >= 0)
    .map(toItem)

  return {
    newLeads,
    depositFollowUps,
    upcomingPrep,
    finalBalanceReminders,
    postEventFollowUps,
    overduePrepTasks,
    failedEmailCount,
    dsApplicationsPending: dsAppCount,
    dsProjectsAwaitingInput: dsAwaitingCount,
  }
}
