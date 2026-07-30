/**
 * Canonical private-dining pipeline values for `BookingInquiry.status`.
 * Legacy values (e.g. "New", "Quote Sent", "booked") remain valid in the DB;
 * admin UI lists the canonical set below.
 */
export const BOOKING_PIPELINE_STATUSES = [
  'new_inquiry',
  'reviewing',
  'quote_sent',
  'awaiting_deposit',
  'confirmed',
  'in_prep',
  'completed',
  'cancelled',
] as const

export type BookingPipelineStatus = (typeof BOOKING_PIPELINE_STATUSES)[number]

export const BOOKING_PIPELINE_STATUS_LABEL: Record<BookingPipelineStatus, string> = {
  new_inquiry: 'New inquiry',
  reviewing: 'Reviewing',
  quote_sent: 'Quote sent',
  awaiting_deposit: 'Awaiting deposit',
  confirmed: 'Confirmed',
  in_prep: 'In prep',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/** Case-insensitive status groups used by Action Queue / pipeline helpers. Includes legacy spellings. */
export const BOOKING_STATUS_GROUPS = {
  newLike: [
    'new',
    'new_inquiry',
    'pending',
    'contacted',
    'reviewing',
    'reviewed',
  ],
  quoteSentLike: [
    'quote_sent',
    'quoted',
    'quote sent',
    'awaiting_deposit',
  ],
  confirmedLike: ['confirmed', 'booked', 'in_prep'],
  completedLike: ['completed', 'closed'],
  cancelledLike: ['cancelled', 'canceled', 'declined', 'refunded'],
} as const

export function normalizeBookingStatus(status: string | null | undefined): string {
  return (status || '').trim().toLowerCase()
}

export function statusMatchesGroup(
  status: string | null | undefined,
  group: readonly string[],
): boolean {
  const normalized = normalizeBookingStatus(status)
  if (!normalized) return false
  return group.some((candidate) => candidate.toLowerCase() === normalized)
}

/**
 * Whether a successful quote-offer email may set status → quote_sent.
 * Never regress cancelled / declined / completed / confirmed (or later) bookings.
 */
export function canAdvanceToQuoteSent(status: string | null | undefined): boolean {
  const normalized = normalizeBookingStatus(status)
  if (!normalized) return true
  if (statusMatchesGroup(normalized, BOOKING_STATUS_GROUPS.cancelledLike)) return false
  if (statusMatchesGroup(normalized, BOOKING_STATUS_GROUPS.completedLike)) return false
  if (statusMatchesGroup(normalized, BOOKING_STATUS_GROUPS.confirmedLike)) return false
  if (normalized === 'awaiting_deposit') return false
  return true
}

/** Whether job completion may set inquiry status → completed. */
export function canMarkPipelineCompleted(status: string | null | undefined): boolean {
  return !statusMatchesGroup(status, BOOKING_STATUS_GROUPS.cancelledLike)
}

export function isBookingPipelineStatus(s: string): s is BookingPipelineStatus {
  return (BOOKING_PIPELINE_STATUSES as readonly string[]).includes(s)
}
