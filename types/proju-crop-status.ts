/**
 * Phase 2M-F: ProJu Crop Status Types
 * 
 * Internal crop validation & tagging system (admin-only)
 * Status values are canonical - do not add new ones without approval
 */

export type ProJuCropStatus = 'draft' | 'validated' | 'limited' | 'paused' | 'retired'

export interface ProJuCropStatusEntry {
  status: ProJuCropStatus
  note: string
  lastValidated: string | null // ISO date string
}

export interface ProJuCropStatusData {
  [ingredientKey: string]: ProJuCropStatusEntry
}

/**
 * Status meanings:
 * - draft: Seen in bookings, not validated
 * - validated: Confirmed by ≥3 PAPG farmers
 * - limited: Confirmed by 1–2 farmers only
 * - paused: Temporarily stopped
 * - retired: No longer tracked
 */
