/**
 * Safe handling for ISO date-only strings (`YYYY-MM-DD`).
 * `new Date('2026-10-01')` is UTC midnight and can display the previous day in US timezones.
 */

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parse `YYYY-MM-DD` as a local calendar date; otherwise fall back to `new Date(value)`. */
export function parseLocalDateOnly(value: string): Date {
  const trimmed = value.trim()
  const match = DATE_ONLY_RE.exec(trimmed)

  if (!match) {
    return new Date(trimmed)
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  return new Date(year, month - 1, day)
}

/** End of the local calendar day for a date-only (or other) value. */
export function endOfLocalDateOnly(value: string): Date {
  const date = parseLocalDateOnly(value)
  if (Number.isNaN(date.getTime())) return date
  date.setHours(23, 59, 59, 999)
  return date
}

/**
 * True when `now` is after the end of the expiry calendar day.
 * A quote expiring on 2026-10-01 remains valid through local end of that day.
 */
export function isDateOnlyExpired(value: string, now: Date = new Date()): boolean {
  const end = endOfLocalDateOnly(value)
  if (Number.isNaN(end.getTime())) return false
  return now.getTime() > end.getTime()
}

/** Days remaining until end of the date-only calendar day (can be fractional / negative). */
export function daysUntilDateOnlyEnd(value: string, now: Date = new Date()): number {
  const end = endOfLocalDateOnly(value)
  if (Number.isNaN(end.getTime())) return Number.NaN
  return (end.getTime() - now.getTime()) / 86_400_000
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

/** Format a date-only (or parseable) string for display in local time. */
export function formatDateOnly(
  value: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): string {
  const date = parseLocalDateOnly(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', options)
}
