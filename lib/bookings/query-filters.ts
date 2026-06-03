import type { BookingInquiry } from '@/types/booking'
import type { ReminderType } from '@/lib/reminders/buildReminderText'

/** Prep gate fields (aligned with `lib/admin-prep-attention.ts`). */
export function isPrepGatesIncomplete(b: BookingInquiry): boolean {
  return (
    !b.menu_confirmed ||
    !b.guest_count_confirmed ||
    !b.arrival_time_confirmed ||
    !b.location_confirmed ||
    !b.ingredients_sourced ||
    !b.equipment_packed
  )
}

function statusLower(s: string) {
  return s.trim().toLowerCase()
}

function isExcludedTerminal(b: BookingInquiry): boolean {
  const s = statusLower(b.status)
  return s === 'cancelled' || s === 'declined' || s === 'closed'
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function parseEventDay(b: BookingInquiry): Date {
  const raw = b.event_date || ''
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (m) return startOfDay(new Date(`${m[1]}T12:00:00`))
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return startOfDay(new Date())
  return startOfDay(d)
}

export type ParsedBookingsQuery = {
  status?: string
  prep?: 'incomplete'
  upcomingDays?: number
  deposit?: 'pending'
  balance?: 'pending'
  testimonial?: 'needed'
}

export function parseBookingsQuery(searchParams: {
  [key: string]: string | string[] | undefined
}): ParsedBookingsQuery {
  const g = (k: string) => {
    const v = searchParams[k]
    if (Array.isArray(v)) return v[0]
    return v
  }

  const status = g('status')?.trim()
  const prep = g('prep')?.toLowerCase() === 'incomplete' ? 'incomplete' : undefined
  const deposit = g('deposit')?.toLowerCase() === 'pending' ? 'pending' : undefined
  const balance = g('balance')?.toLowerCase() === 'pending' ? 'pending' : undefined
  const testimonial = g('testimonial')?.toLowerCase() === 'needed' ? 'needed' : undefined

  const upcomingRaw = g('upcoming')
  let upcomingDays: number | undefined
  if (upcomingRaw != null && upcomingRaw !== '') {
    const n = parseInt(upcomingRaw, 10)
    if (Number.isFinite(n) && n >= 0 && n <= 365) upcomingDays = n
  }

  return {
    status: status || undefined,
    prep,
    upcomingDays,
    deposit,
    balance,
    testimonial,
  }
}

export function applyBookingsQueryFilter(
  bookings: BookingInquiry[],
  q: ParsedBookingsQuery
): BookingInquiry[] {
  const today = startOfDay(new Date())
  let list = [...bookings]

  if (q.status) {
    const want = q.status.toLowerCase()
    list = list.filter((b) => statusLower(b.status) === want)
  }

  if (q.upcomingDays != null) {
    const end = new Date(today)
    end.setDate(end.getDate() + q.upcomingDays)
    list = list.filter((b) => {
      const ev = parseEventDay(b)
      return ev.getTime() >= today.getTime() && ev.getTime() <= end.getTime()
    })
  }

  if (q.prep === 'incomplete') {
    list = list.filter((b) => !isExcludedTerminal(b) && isPrepGatesIncomplete(b))
  }

  if (q.deposit === 'pending') {
    list = list.filter((b) => {
      if (isExcludedTerminal(b)) return false
      if (b.paid_at) return false
      const s = statusLower(b.status)
      const quotedish = s === 'quoted' || s === 'quote sent' || s === 'quote_sent' || s === 'booked'
      if (!quotedish) return false
      const ev = parseEventDay(b)
      const end = new Date(today)
      end.setDate(end.getDate() + 14)
      return ev.getTime() >= today.getTime() && ev.getTime() <= end.getTime()
    })
  }

  if (q.balance === 'pending') {
    list = list.filter((b) => {
      if (isExcludedTerminal(b)) return false
      if (statusLower(b.status) !== 'confirmed') return false
      if (b.balance_paid_at || b.fully_paid_at) return false
      const ev = parseEventDay(b)
      const end = new Date(today)
      end.setDate(end.getDate() + 14)
      return ev.getTime() >= today.getTime() && ev.getTime() <= end.getTime()
    })
  }

  if (q.testimonial === 'needed') {
    list = list.filter((b) => {
      if (statusLower(b.status) !== 'completed') return false
      if (b.testimonial_received_at) return false
      const ev = parseEventDay(b)
      return ev.getTime() < today.getTime()
    })
  }

  return list
}

export function describeBookingsQuery(q: ParsedBookingsQuery): string[] {
  const parts: string[] = []
  if (q.status) parts.push(`Status: ${q.status}`)
  if (q.upcomingDays != null) parts.push(`Event in next ${q.upcomingDays} days`)
  if (q.prep === 'incomplete') parts.push('Prep gates incomplete')
  if (q.deposit === 'pending') parts.push('Deposit pending (quoted/booked, next 14d)')
  if (q.balance === 'pending') parts.push('Final balance pending (confirmed, next 14d)')
  if (q.testimonial === 'needed') parts.push('Testimonial follow-up (completed, event passed)')
  return parts
}

export function bookingsQueryToSearchParams(q: ParsedBookingsQuery): string {
  const p = new URLSearchParams()
  if (q.status) p.set('status', q.status)
  if (q.prep) p.set('prep', q.prep)
  if (q.upcomingDays != null) p.set('upcoming', String(q.upcomingDays))
  if (q.deposit) p.set('deposit', q.deposit)
  if (q.balance) p.set('balance', q.balance)
  if (q.testimonial) p.set('testimonial', q.testimonial)
  const s = p.toString()
  return s ? `?${s}` : ''
}

/**
 * When set, bulk reminder copy on /admin/bookings uses this template for all selected rows.
 * Priority: deposit → testimonial → balance → prep (first match in query).
 */
export function bulkReminderTypeForQuery(q: ParsedBookingsQuery): ReminderType | null {
  if (q.deposit === 'pending') return 'deposit'
  if (q.testimonial === 'needed') return 'testimonial'
  if (q.balance === 'pending') return 'final_balance'
  if (q.prep === 'incomplete') return 'prep'
  return null
}

export function bulkReminderLabel(type: ReminderType): string {
  switch (type) {
    case 'deposit':
      return 'Deposit reminder'
    case 'testimonial':
      return 'Testimonial follow-up'
    case 'final_balance':
      return 'Final balance reminder'
    case 'prep':
      return 'Prep check-in'
    default: {
      const _x: never = type
      return _x
    }
  }
}
