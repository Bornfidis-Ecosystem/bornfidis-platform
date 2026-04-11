/**
 * Provisions pipeline board — map booking statuses to column ids and labels.
 * Used by /admin/provisions-pipeline to group BookingInquiry records.
 */

export const PIPELINE_COLUMNS = [
  { id: 'new', label: 'New', statuses: ['New', 'pending', 'Contacted', 'reviewed', 'Cancelled', 'Canceled', 'declined'] },
  { id: 'quote_sent', label: 'Quote Sent', statuses: ['Quote Sent', 'quote_sent', 'quoted'] },
  { id: 'follow_up', label: 'Follow Up', statuses: ['Follow Up', 'follow_up'] },
  { id: 'confirmed', label: 'Confirmed', statuses: ['Confirmed', 'booked'] },
  { id: 'completed', label: 'Completed', statuses: ['Completed', 'Closed'] },
] as const

export type PipelineColumnId = (typeof PIPELINE_COLUMNS)[number]['id']

/** Canonical status to persist when moving a booking to a column */
export const COLUMN_TO_STATUS: Record<PipelineColumnId, string> = {
  new: 'New',
  quote_sent: 'Quote Sent',
  follow_up: 'Follow Up',
  confirmed: 'Confirmed',
  completed: 'Completed',
}

export function getColumnIdForStatus(status: string): PipelineColumnId {
  const normalized = (status || '').trim()
  for (const col of PIPELINE_COLUMNS) {
    if (col.statuses.some((s) => s.toLowerCase() === normalized.toLowerCase())) return col.id
  }
  return 'new'
}
