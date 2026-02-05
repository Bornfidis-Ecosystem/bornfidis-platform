/**
 * Phase 2M-F: ProJu Crop Status Management
 * 
 * Read/write internal crop validation status from JSON file
 * Admin-only access, no automation
 */

import fs from 'fs'
import path from 'path'
import type {
  ProJuCropStatus,
  ProJuCropStatusData,
  ProJuCropStatusEntry,
} from '@/types/proju-crop-status'

const STATUS_FILE_PATH = path.join(process.cwd(), 'data', 'proju-crop-status.json')

/**
 * Get the status file path
 */
export function getStatusFilePath(): string {
  return STATUS_FILE_PATH
}

/**
 * Read crop status data from JSON file
 */
export function readCropStatus(): ProJuCropStatusData {
  try {
    if (!fs.existsSync(STATUS_FILE_PATH)) {
      // Return empty object if file doesn't exist
      return {}
    }

    const fileContent = fs.readFileSync(STATUS_FILE_PATH, 'utf8')
    const data = JSON.parse(fileContent) as ProJuCropStatusData

    // Remove _comment field if present
    const { _comment, ...statusData } = data
    return statusData
  } catch (error) {
    console.error('Error reading crop status file:', error)
    return {}
  }
}

/**
 * Write crop status data to JSON file
 */
export function writeCropStatus(data: ProJuCropStatusData): void {
  try {
    const dir = path.dirname(STATUS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const fileContent = JSON.stringify(data, null, 2)
    fs.writeFileSync(STATUS_FILE_PATH, fileContent, 'utf8')
  } catch (error) {
    console.error('Error writing crop status file:', error)
    throw error
  }
}

/**
 * Get status for a specific ingredient (by normalized key)
 */
export function getCropStatus(ingredientName: string): ProJuCropStatusEntry | null {
  const statusData = readCropStatus()
  const key = normalizeIngredientKey(ingredientName)
  return statusData[key] || null
}

/**
 * Update status for a specific ingredient
 */
export function updateCropStatus(
  ingredientName: string,
  status: ProJuCropStatus,
  note: string,
  lastValidated?: string | null
): void {
  const statusData = readCropStatus()
  const key = normalizeIngredientKey(ingredientName)

  statusData[key] = {
    status,
    note,
    lastValidated: lastValidated || (status === 'validated' ? new Date().toISOString() : null),
  }

  writeCropStatus(statusData)
}

/**
 * Normalize ingredient name to key format (lowercase, underscores)
 */
function normalizeIngredientKey(ingredientName: string): string {
  return ingredientName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

/**
 * Check if an ingredient is ready for PAPG coordination
 * Only validated or limited crops may proceed
 */
export function isCropReadyForPAPG(ingredientName: string): boolean {
  const entry = getCropStatus(ingredientName)
  if (!entry) {
    return false // Not tagged = not ready
  }
  return entry.status === 'validated' || entry.status === 'limited'
}

/**
 * Get all crops by status
 */
export function getCropsByStatus(status: ProJuCropStatus): Array<{
  ingredientKey: string
  entry: ProJuCropStatusEntry
}> {
  const statusData = readCropStatus()
  return Object.entries(statusData)
    .filter(([_, entry]) => entry.status === status)
    .map(([key, entry]) => ({ ingredientKey: key, entry }))
}
