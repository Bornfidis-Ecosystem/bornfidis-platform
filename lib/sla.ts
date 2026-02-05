/**
 * Phase 2AJ — SLA Alerts & Escalations
 * Assignment, Confirmation, Prep, Arrival SLAs. Evaluate open bookings; alert once per breach; escalate if unresolved.
 */

import { db } from '@/lib/db'

export const ASSIGNMENT_SLA_HOURS = Number(process.env.SLA_ASSIGNMENT_HOURS) || 24
export const CONFIRMATION_SLA_HOURS = Number(process.env.SLA_CONFIRMATION_HOURS) || 48
export const PREP_T_MINUS_HOURS = 24
export const ARRIVAL_GRACE_MINUTES = Number(process.env.SLA_ARRIVAL_GRACE_MINUTES) || 15
export const ESCALATION_WINDOW_HOURS = Number(process.env.SLA_ESCALATION_WINDOW_HOURS) || 4
export const QUIET_START_HOUR = Number(process.env.SLA_QUIET_START_HOUR) ?? 22 // 10pm
export const QUIET_END_HOUR = Number(process.env.SLA_QUIET_END_HOUR) ?? 7   // 7am

export type SlaBreachType = 'assignment' | 'confirmation' | 'prep' | 'arrival'
export type SlaStatus = 'on_track' | 'at_risk' | 'breached'

export type SlaBreachEntry = {
  type: SlaBreachType
  breachedAt: string
  alertedAt?: string
  escalatedAt?: string
}

function getScheduledAt(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const parts = eventTime.trim().split(':').map(Number)
    d.setHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0)
  }
  return d
}

export type BookingForSla = {
  id: string
  name: string
  createdAt: Date
  eventDate: Date
  eventTime: string | null
  assignedChefId: string | null
  jobCompletedAt: Date | null
  slaStatus: string | null
  slaBreaches: unknown
  slaAlertedAt: Date | null
  slaEscalatedAt: Date | null
  chefAssignment?: { createdAt: Date; status: string } | null
}

export type SlaEvalResult = {
  status: SlaStatus
  breaches: SlaBreachEntry[]
  newBreaches: SlaBreachType[]
}

/**
 * Evaluate one booking against SLA rules. Returns status, all breaches, and which are new (not yet in slaBreaches).
 */
export function evaluateBookingSla(booking: BookingForSla): SlaEvalResult {
  const now = new Date()
  const existing = (booking.slaBreaches as SlaBreachEntry[] | null) ?? []
  const existingTypes = new Set(existing.map((b) => b.type))
  const breaches: SlaBreachEntry[] = []
  const newBreaches: SlaBreachType[] = []

  const eventAt = getScheduledAt(booking.eventDate, booking.eventTime)
  const assignment = booking.chefAssignment

  // Assignment SLA: chef assigned within X hours of booking creation
  if (!booking.assignedChefId) {
    const deadline = new Date(booking.createdAt)
    deadline.setHours(deadline.getHours() + ASSIGNMENT_SLA_HOURS)
    if (now > deadline) {
      breaches.push({ type: 'assignment', breachedAt: deadline.toISOString() })
      if (!existingTypes.has('assignment')) newBreaches.push('assignment')
    }
  }

  // Confirmation SLA: chef confirms within Y hours of assignment
  if (assignment && (assignment.status === 'ASSIGNED')) {
    const deadline = new Date(assignment.createdAt)
    deadline.setHours(deadline.getHours() + CONFIRMATION_SLA_HOURS)
    if (now > deadline) {
      breaches.push({ type: 'confirmation', breachedAt: deadline.toISOString() })
      if (!existingTypes.has('confirmation')) newBreaches.push('confirmation')
    }
  }

  // Prep SLA: prep started by T–24h
  if (assignment && eventAt && !booking.jobCompletedAt) {
    const prepDeadline = new Date(eventAt)
    prepDeadline.setHours(prepDeadline.getHours() - PREP_T_MINUS_HOURS)
    if (now > prepDeadline && assignment.status !== 'IN_PREP' && assignment.status !== 'COMPLETED') {
      breaches.push({ type: 'prep', breachedAt: prepDeadline.toISOString() })
      if (!existingTypes.has('prep')) newBreaches.push('prep')
    }
  }

  // Arrival SLA: on-time (± grace) — job completed by event + grace
  if (booking.jobCompletedAt && eventAt) {
    const graceEnd = new Date(eventAt)
    graceEnd.setMinutes(graceEnd.getMinutes() + ARRIVAL_GRACE_MINUTES)
    if (new Date(booking.jobCompletedAt) > graceEnd) {
      breaches.push({ type: 'arrival', breachedAt: graceEnd.toISOString() })
      if (!existingTypes.has('arrival')) newBreaches.push('arrival')
    }
  } else if (eventAt && now > eventAt) {
    const graceEnd = new Date(eventAt)
    graceEnd.setMinutes(graceEnd.getMinutes() + ARRIVAL_GRACE_MINUTES)
    if (!booking.jobCompletedAt && now > graceEnd) {
      breaches.push({ type: 'arrival', breachedAt: graceEnd.toISOString() })
      if (!existingTypes.has('arrival')) newBreaches.push('arrival')
    }
  }

  const status: SlaStatus = breaches.length > 0 ? 'breached' : 'on_track'
  return { status, breaches, newBreaches }
}

/**
 * Merge new breach alerts into existing slaBreaches (set alertedAt for new ones).
 */
export function mergeBreachesWithAlerts(
  existing: SlaBreachEntry[],
  current: SlaBreachEntry[],
  now: Date
): SlaBreachEntry[] {
  const byType = new Map(existing.map((b) => [b.type, b]))
  for (const b of current) {
    const prev = byType.get(b.type)
    if (prev) {
      byType.set(b.type, { ...b, alertedAt: prev.alertedAt, escalatedAt: prev.escalatedAt })
    } else {
      byType.set(b.type, { ...b, alertedAt: now.toISOString() })
    }
  }
  return Array.from(byType.values())
}

/**
 * Open bookings that need SLA evaluation (event date today or future, not cancelled).
 */
export async function getOpenBookingsForSla(): Promise<BookingForSla[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const rows = await db.bookingInquiry.findMany({
    where: {
      eventDate: { gte: today },
      status: { notIn: ['Cancelled', 'Canceled'] },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      eventDate: true,
      eventTime: true,
      assignedChefId: true,
      jobCompletedAt: true,
      slaStatus: true,
      slaBreaches: true,
      slaAlertedAt: true,
      slaEscalatedAt: true,
      chefAssignment: {
        select: { createdAt: true, status: true },
      },
    },
    orderBy: { eventDate: 'asc' },
  })
  return rows as BookingForSla[]
}

/**
 * Bookings with sla_status = at_risk or breached (for ops dashboard).
 */
export async function getBookingsSlaAtRisk(): Promise<Array<{
  id: string
  name: string
  eventDate: Date
  eventTime: string | null
  status: string
  slaStatus: string | null
  slaBreaches: unknown
}>> {
  const rows = await db.bookingInquiry.findMany({
    where: {
      slaStatus: { in: ['at_risk', 'breached'] },
      eventDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    select: {
      id: true,
      name: true,
      eventDate: true,
      eventTime: true,
      status: true,
      slaStatus: true,
      slaBreaches: true,
    },
    orderBy: { eventDate: 'asc' },
    take: 50,
  })
  return rows
}

export async function updateBookingSla(
  bookingId: string,
  data: {
    slaStatus: SlaStatus
    slaBreaches: SlaBreachEntry[]
    slaAlertedAt?: Date | null
    slaEscalatedAt?: Date | null
  }
): Promise<void> {
  await db.bookingInquiry.update({
    where: { id: bookingId },
    data: {
      slaStatus: data.slaStatus,
      slaBreaches: data.slaBreaches as object,
      ...(data.slaAlertedAt !== undefined && { slaAlertedAt: data.slaAlertedAt }),
      ...(data.slaEscalatedAt !== undefined && { slaEscalatedAt: data.slaEscalatedAt }),
    },
  })
}

export async function acknowledgeSla(bookingId: string, userId: string): Promise<void> {
  await db.bookingInquiry.update({
    where: { id: bookingId },
    data: {
      slaAcknowledgedAt: new Date(),
      slaAcknowledgedBy: userId,
    },
  })
}

/**
 * Quiet hours: no alerts 10pm–7am (configurable). Use server TZ or UTC.
 */
export function isQuietHours(): boolean {
  const hour = new Date().getHours()
  if (QUIET_END_HOUR > QUIET_START_HOUR) {
    return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR
  }
  return hour >= QUIET_START_HOUR && hour < QUIET_END_HOUR
}

/**
 * Rate limit: already alerted for this breach type in last 24h?
 */
export function wasAlertedRecently(breaches: SlaBreachEntry[], type: SlaBreachType): boolean {
  const entry = breaches.find((b) => b.type === type)
  if (!entry?.alertedAt) return false
  const t = new Date(entry.alertedAt).getTime()
  return Date.now() - t < 24 * 60 * 60 * 1000
}

export function getAdminEmails(): string[] {
  const s = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL
  if (!s) return []
  return s.split(',').map((e) => e.trim()).filter(Boolean)
}

export function getOpsLeadEmail(): string | null {
  return process.env.OPS_LEAD_EMAIL?.trim() || null
}
