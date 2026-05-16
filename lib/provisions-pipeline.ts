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
      'Cancelled',
      'Canceled',
      'canceled',
      'cancelled',
      'declined',
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

export function getColumnIdForStatus(status: string): PipelineColumnId {
  const normalized = (status || '').trim()
  for (const col of PIPELINE_COLUMNS) {
    if (col.statuses.some((s) => s.toLowerCase() === normalized.toLowerCase())) return col.id
  }
  return 'new'
}
