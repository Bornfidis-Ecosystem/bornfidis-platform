type MonthParseResult = {
  monthStart: Date
  monthKey: string
}

const MONTH_QUERY_RE = /^(\d{4})-(\d{2})$/

function toMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseMonthQuery(input?: string | null): MonthParseResult {
  const now = new Date()
  const fallback = new Date(now.getFullYear(), now.getMonth(), 1)

  if (!input) return { monthStart: fallback, monthKey: toMonthKey(fallback) }

  const match = input.match(MONTH_QUERY_RE)
  if (!match) return { monthStart: fallback, monthKey: toMonthKey(fallback) }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return { monthStart: fallback, monthKey: toMonthKey(fallback) }
  }

  const parsed = new Date(year, monthIndex, 1)
  return { monthStart: parsed, monthKey: toMonthKey(parsed) }
}

export function getMonthGridDates(monthStart: Date): Date[] {
  const firstOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())

  const dates: Date[] = []
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function getAdjacentMonthKey(monthStart: Date, deltaMonths: number): string {
  const next = new Date(monthStart.getFullYear(), monthStart.getMonth() + deltaMonths, 1)
  return toMonthKey(next)
}

export function formatDateKey(date: Date): string {
  return toDateKey(date)
}

export function groupBookingsByDate<T extends { eventDate: Date }>(bookings: T[]): Record<string, T[]> {
  return bookings.reduce<Record<string, T[]>>((acc, booking) => {
    const key = toDateKey(booking.eventDate)
    if (!acc[key]) acc[key] = []
    acc[key].push(booking)
    return acc
  }, {})
}

