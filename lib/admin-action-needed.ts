import { db } from '@/lib/db'
import { getFailedEmailCount } from '@/lib/email-send-log'

export type ActionNeededItem = {
  id: string
  name: string
  status: string
  /** ISO string — safe to pass from Server Components into client components. */
  eventDate: string
  eventType?: string | null
}

export type AdminActionNeeded = {
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

function isStatus(status: string, expected: string) {
  return status.trim().toLowerCase() === expected.toLowerCase()
}

export async function getAdminActionNeeded(): Promise<AdminActionNeeded> {
  const today = startOfDay(new Date())
  const lookbackStart = addDays(today, -3)
  const lookaheadEnd = addDays(today, 14)

  const [bookings, failedEmailCount, dsAppCount, dsAwaitingCount] = await Promise.all([
    db.bookingInquiry.findMany({
      where: {
        eventDate: { gte: lookbackStart, lte: lookaheadEnd },
        OR: [
          { status: { equals: 'Quoted', mode: 'insensitive' } },
          { status: { equals: 'Booked', mode: 'insensitive' } },
          { status: { equals: 'Confirmed', mode: 'insensitive' } },
          { status: { equals: 'Completed', mode: 'insensitive' } },
        ],
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

  const base = bookings.map((b) => ({
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

  const depositFollowUps = base
    .filter(
      (b) =>
        (isStatus(b.status, 'Quoted') || isStatus(b.status, 'Booked')) &&
        !b.paidAt &&
        b.daysFromToday >= 0 &&
        b.daysFromToday <= 14
    )
    .map(({ paidAt, balancePaidAt, daysFromToday, overdueTaskCount, ...item }) => item)

  const upcomingPrep = base
    .filter((b) => isStatus(b.status, 'Confirmed') && b.daysFromToday >= 0 && b.daysFromToday <= 3)
    .map(({ paidAt, balancePaidAt, daysFromToday, overdueTaskCount, ...item }) => item)

  const finalBalanceReminders = base
    .filter(
      (b) =>
        isStatus(b.status, 'Confirmed') &&
        b.daysFromToday >= 0 &&
        b.daysFromToday <= 2 &&
        !b.balancePaidAt
    )
    .map(({ paidAt, balancePaidAt, daysFromToday, overdueTaskCount, ...item }) => item)

  const postEventFollowUps = base
    .filter((b) => isStatus(b.status, 'Completed') && b.daysFromToday >= -3 && b.daysFromToday <= -1)
    .map(({ paidAt, balancePaidAt, daysFromToday, overdueTaskCount, ...item }) => item)

  const overduePrepTasks = base
    .filter((b) => b.overdueTaskCount > 0 && b.daysFromToday >= 0)
    .map(({ paidAt, balancePaidAt, daysFromToday, overdueTaskCount, ...item }) => item)

  return {
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
