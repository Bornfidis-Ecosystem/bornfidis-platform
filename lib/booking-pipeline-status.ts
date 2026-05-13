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

export function isBookingPipelineStatus(s: string): s is BookingPipelineStatus {
  return (BOOKING_PIPELINE_STATUSES as readonly string[]).includes(s)
}
