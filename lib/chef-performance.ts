/**
 * Phase 2N — Chef Performance Metrics (v1)
 * Calculated from ChefAssignment, BookingInquiry, ChefPrepChecklist.
 * No new schema.
 */

import { db } from '@/lib/db'
import { ChefBookingStatus } from '@prisma/client'

export type ChefPerformanceMetrics = {
  jobsCompleted: number
  onTimeRatePercent: number | null // null if no completed jobs with jobCompletedAt
  prepCompletionRatePercent: number | null // null if no completed jobs with checklist
  cancellationRatePercent: number // 0 for v1 (no CANCELLED in enum yet)
  avgPayoutCents: number | null // null if no payouts
  lastJobs: Array<{
    id: string
    bookingName: string
    eventDate: Date
    status: ChefBookingStatus
    payoutCents: number | null
  }>
}

/**
 * Build scheduled datetime from booking eventDate + eventTime for on-time comparison.
 */
function getScheduledAt(eventDate: Date, eventTime: string | null): Date {
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
 * Phase 2N — Compute performance metrics for a chef (Prisma User.id).
 */
export async function getChefPerformanceMetrics(
  chefId: string,
  options: { lastJobsLimit?: number } = {}
): Promise<ChefPerformanceMetrics> {
  const limit = options.lastJobsLimit ?? 10

  const assignments = await db.chefAssignment.findMany({
    where: { chefId },
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          eventDate: true,
          eventTime: true,
          jobCompletedAt: true,
          chefPayoutAmountCents: true,
        },
      },
    },
  })

  const completed = assignments.filter((a) => a.status === 'COMPLETED')
  const jobsCompleted = completed.length

  // On-time: % of completed jobs where jobCompletedAt <= scheduled (eventDate + eventTime)
  let onTimeCount = 0
  let onTimeDenom = 0
  for (const a of completed) {
    const at = a.booking.jobCompletedAt
    if (!at) continue
    onTimeDenom++
    const scheduled = getScheduledAt(a.booking.eventDate, a.booking.eventTime)
    if (new Date(at) <= scheduled) onTimeCount++
  }
  const onTimeRatePercent =
    onTimeDenom === 0 ? null : Math.round((onTimeCount / onTimeDenom) * 100)

  // Prep completion: % of completed jobs where ChefPrepChecklist has all required items checked
  const template = await db.prepChecklistTemplate.findFirst({
    where: {},
    orderBy: { createdAt: 'asc' },
  })
  const requiredIndices =
    template?.items && Array.isArray(template.items)
      ? (template.items as { required?: boolean }[])
          .map((item, i) => (item.required ? i : -1))
          .filter((i) => i >= 0)
      : []

  let prepCompleteCount = 0
  let prepDenom = 0
  for (const a of completed) {
    const checklist = await db.chefPrepChecklist.findUnique({
      where: { bookingId: a.bookingId },
      include: { template: true },
    })
    if (!checklist) continue
    prepDenom++
    const completedMap = (checklist.completed as Record<string, boolean>) ?? {}
    const templateForChecklist = checklist.template ?? template
    const required =
      templateForChecklist?.items && Array.isArray(templateForChecklist.items)
        ? (templateForChecklist.items as { required?: boolean }[])
            .map((item, i) => (item.required ? i : -1))
            .filter((i) => i >= 0)
        : requiredIndices
    const allRequiredChecked = required.length === 0 || required.every((i) => completedMap[String(i)] === true)
    if (allRequiredChecked) prepCompleteCount++
  }
  const prepCompletionRatePercent =
    prepDenom === 0 ? null : Math.round((prepCompleteCount / prepDenom) * 100)

  // Cancellation: v1 no CANCELLED in enum → 0
  const cancellationRatePercent = 0

  // Avg payout: avg of chefPayoutAmountCents for this chef's assignments where set
  const payoutCentsList = assignments
    .map((a) => a.booking.chefPayoutAmountCents)
    .filter((c): c is number => c != null && c > 0)
  const avgPayoutCents =
    payoutCentsList.length === 0
      ? null
      : Math.round(
          payoutCentsList.reduce((s, c) => s + c, 0) / payoutCentsList.length
        )

  // Last N jobs for table
  const lastJobs = assignments.slice(0, limit).map((a) => ({
    id: a.id,
    bookingName: a.booking.name,
    eventDate: a.booking.eventDate,
    status: a.status as ChefBookingStatus,
    payoutCents: a.booking.chefPayoutAmountCents,
  }))

  return {
    jobsCompleted,
    onTimeRatePercent,
    prepCompletionRatePercent,
    cancellationRatePercent,
    avgPayoutCents,
    lastJobs,
  }
}

/**
 * Phase 2N — List chef IDs (Prisma User.id) that have at least one ChefAssignment.
 * For admin "all chefs" performance index.
 */
export async function getChefIdsWithAssignments(): Promise<
  Array<{ id: string; name: string | null }>
> {
  const users = await db.user.findMany({
    where: {
      chefAssignments: { some: {} },
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return users.map((u) => ({ id: u.id, name: u.name }))
}
