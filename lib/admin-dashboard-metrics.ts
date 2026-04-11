import { db } from '@/lib/db'

export type AdminDashboardMetrics = {
  pipeline: {
    newLeads: number
    quoted: number
    awaitingDeposit: number
    confirmed: number
    completed: number
  }
  revenue: {
    totalQuotedRevenueCents: number
    confirmedRevenueCents: number
    depositsCollectedCents: number
  }
  weekly: {
    bookingsCreated: number
    quotesCreated: number
    depositsReceived: number
  }
  upcoming: Array<{
    id: string
    name: string
    eventDate: Date
    status: string
    eventType: string | null
  }>
}

function isNewLeadStatus(status: string) {
  const s = status.trim().toLowerCase()
  return s === 'new' || s === 'pending' || s === 'reviewed'
}

function isQuotedStatus(status: string) {
  return status.trim().toLowerCase() === 'quoted'
}

function isConfirmedStatus(status: string) {
  return status.trim().toLowerCase() === 'confirmed'
}

function isCompletedStatus(status: string) {
  return status.trim().toLowerCase() === 'completed'
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const next7DaysEnd = new Date(todayStart)
  next7DaysEnd.setDate(next7DaysEnd.getDate() + 7)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [statusBuckets, awaitingDeposit, quotedRevenueRows, confirmedRevenueRows, depositsCollected, bookingsCreated, quotesCreated, depositsReceived, upcoming] =
    await Promise.all([
      db.bookingInquiry.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      db.bookingInquiry.count({
        where: {
          status: { equals: 'booked', mode: 'insensitive' },
          paidAt: null,
        },
      }),
      db.bookingInquiry.findMany({
        where: { quoteTotalCents: { gt: 0 } },
        select: { quoteTotalCents: true },
      }),
      db.bookingInquiry.findMany({
        where: {
          OR: [
            { status: { equals: 'Confirmed', mode: 'insensitive' } },
            { status: { equals: 'Completed', mode: 'insensitive' } },
          ],
        },
        select: { quoteTotalCents: true, totalCents: true },
      }),
      db.bookingInquiry.aggregate({
        where: { paidAt: { not: null } },
        _sum: { depositAmountCents: true },
      }),
      db.bookingInquiry.count({
        where: { createdAt: { gte: weekStart } },
      }),
      db.bookingInquiry.count({
        where: {
          OR: [{ quoteUpdatedAt: { gte: weekStart } }, { quoteSentAt: { gte: weekStart } }],
        },
      }),
      db.bookingInquiry.count({
        where: { paidAt: { gte: weekStart } },
      }),
      db.bookingInquiry.findMany({
        where: {
          eventDate: {
            gte: todayStart,
            lte: next7DaysEnd,
          },
        },
        select: {
          id: true,
          name: true,
          eventDate: true,
          status: true,
          eventType: true,
        },
        orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }],
        take: 20,
      }),
    ])

  const pipeline = statusBuckets.reduce(
    (acc, row) => {
      const count = row._count._all
      if (isNewLeadStatus(row.status)) acc.newLeads += count
      if (isQuotedStatus(row.status)) acc.quoted += count
      if (isConfirmedStatus(row.status)) acc.confirmed += count
      if (isCompletedStatus(row.status)) acc.completed += count
      return acc
    },
    { newLeads: 0, quoted: 0, confirmed: 0, completed: 0 }
  )

  const totalQuotedRevenueCents = quotedRevenueRows.reduce((sum, row) => sum + (row.quoteTotalCents ?? 0), 0)
  const confirmedRevenueCents = confirmedRevenueRows.reduce(
    (sum, row) => sum + (row.totalCents ?? row.quoteTotalCents ?? 0),
    0
  )

  return {
    pipeline: {
      ...pipeline,
      awaitingDeposit,
    },
    revenue: {
      totalQuotedRevenueCents,
      confirmedRevenueCents,
      depositsCollectedCents: depositsCollected._sum.depositAmountCents ?? 0,
    },
    weekly: {
      bookingsCreated,
      quotesCreated,
      depositsReceived,
    },
    upcoming,
  }
}

