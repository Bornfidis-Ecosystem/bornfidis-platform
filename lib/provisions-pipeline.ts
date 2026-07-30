/**
 * Provisions pipeline board — map booking statuses to column ids and labels.
 * Used by /admin/provisions-pipeline to group BookingInquiry records.
 *
 * Includes legacy status strings and private-dining pipeline values (`lib/booking-pipeline-status.ts`).
 */
export const PIPELINE_COLUMNS = [
  {
    id: 'new',
    label: 'New',
    statuses: [
      'New',
      'new_inquiry',
      'pending',
      'Contacted',
      'reviewing',
      'reviewed',
    ],
  },
  {
    id: 'quote_sent',
    label: 'Quote sent',
    statuses: ['Quote Sent', 'quote_sent', 'quoted', 'awaiting_deposit'],
  },
  { id: 'follow_up', label: 'Follow up', statuses: ['Follow Up', 'follow_up'] },
  {
    id: 'confirmed',
    label: 'Confirmed',
    statuses: ['Confirmed', 'booked', 'confirmed', 'in_prep'],
  },
  { id: 'completed', label: 'Completed', statuses: ['Completed', 'Closed', 'completed'] },
] as const

export type PipelineColumnId = (typeof PIPELINE_COLUMNS)[number]['id']

/** Canonical status to persist when moving a booking to a column (legacy + pipeline) */
export const COLUMN_TO_STATUS: Record<PipelineColumnId, string> = {
  new: 'new_inquiry',
  quote_sent: 'quote_sent',
  follow_up: 'Follow Up',
  confirmed: 'confirmed',
  completed: 'completed',
}

/**
 * Cancelled / declined are not shown on the board New column.
 * They remain in booking history; unknown statuses still fall back to New via getColumnIdForStatus.
 */
export function isExcludedFromPipelineBoard(status: string): boolean {
  const normalized = (status || '').trim().toLowerCase()
  return (
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'declined' ||
    normalized === 'refunded'
  )
}

export function getColumnIdForStatus(status: string): PipelineColumnId | null {
  if (isExcludedFromPipelineBoard(status)) return null
  const normalized = (status || '').trim()
  for (const col of PIPELINE_COLUMNS) {
    if (col.statuses.some((s) => s.toLowerCase() === normalized.toLowerCase())) return col.id
  }
  return 'new'
}
