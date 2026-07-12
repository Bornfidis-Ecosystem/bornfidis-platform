/** Normalized booking statuses counted as new / actively reviewing leads. */
export const NEW_LEAD_STATUSES = new Set([
  'new',
  'new_inquiry',
  'pending',
  'reviewed',
  'reviewing',
])

/** Normalized booking statuses counted as quoted / quote sent. */
export const QUOTED_STATUSES = new Set(['quoted', 'quote_sent'])

/** Lowercase + collapse spaces to underscores so "Quote Sent" → "quote_sent". */
export function normalizeStatus(status: string): string {
  return status.trim().toLowerCase().replace(/\s+/g, '_')
}

export function isNewLeadStatus(status: string): boolean {
  return NEW_LEAD_STATUSES.has(normalizeStatus(status))
}

export function isQuotedStatus(status: string): boolean {
  return QUOTED_STATUSES.has(normalizeStatus(status))
}

export function isConfirmedStatus(status: string): boolean {
  return normalizeStatus(status) === 'confirmed'
}

export function isCompletedStatus(status: string): boolean {
  return normalizeStatus(status) === 'completed'
}
