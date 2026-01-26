/**
 * Phone Number Normalization
 * Phase 11G.2: Jamaica phone number support
 * 
 * Handles:
 * - Jamaica: +1-876, +1-658
 * - US: +1
 * - Already formatted: +1XXXXXXXXXX
 */

export interface NormalizePhoneResult {
  normalized: string
  isValid: boolean
  error?: string
}

/**
 * Normalize phone number to E.164 format
 * Supports Jamaica (+1-876, +1-658) and US (+1)
 */
export function normalizePhoneNumber(phone: string): NormalizePhoneResult {
  if (!phone || phone.trim() === '') {
    return {
      normalized: '',
      isValid: false,
      error: 'Phone number is required',
    }
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // If already starts with +, check format
  if (cleaned.startsWith('+')) {
    // Remove + and check
    const digits = cleaned.substring(1)
    
    // Check if it's a valid E.164 format (10-15 digits after +)
    if (digits.length >= 10 && digits.length <= 15) {
      return {
        normalized: cleaned,
        isValid: true,
      }
    } else {
      return {
        normalized: cleaned,
        isValid: false,
        error: 'Invalid phone number format',
      }
    }
  }

  // No + prefix - check if it's a Jamaican or US number
  const digits = cleaned

  // Jamaica: 876XXXXXXXX or 658XXXXXXXX (10 digits total)
  if (digits.length === 10) {
    if (digits.startsWith('876')) {
      return {
        normalized: `+1${digits}`,
        isValid: true,
      }
    } else if (digits.startsWith('658')) {
      return {
        normalized: `+1${digits}`,
        isValid: true,
      }
    } else if (digits.startsWith('1') && digits.length === 11) {
      // US number with leading 1
      return {
        normalized: `+${digits}`,
        isValid: true,
      }
    } else if (digits.length === 10) {
      // Assume US number (10 digits)
      return {
        normalized: `+1${digits}`,
        isValid: true,
      }
    }
  }

  // US: 10 digits
  if (digits.length === 10 && !digits.startsWith('876') && !digits.startsWith('658')) {
    return {
      normalized: `+1${digits}`,
      isValid: true,
    }
  }

  // Invalid length
  return {
    normalized: cleaned,
    isValid: false,
    error: 'Phone number must be 10 digits (Jamaica: 876 or 658 prefix, US: any 10 digits)',
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized.isValid) {
    return phone
  }

  const digits = normalized.normalized.replace(/\D/g, '')
  
  // Format Jamaica numbers: +1 (876) XXX-XXXX
  if (digits.startsWith('1876') && digits.length === 11) {
    const area = digits.substring(1, 4)
    const first = digits.substring(4, 7)
    const last = digits.substring(7)
    return `+1 (${area}) ${first}-${last}`
  }
  
  if (digits.startsWith('1658') && digits.length === 11) {
    const area = digits.substring(1, 4)
    const first = digits.substring(4, 7)
    const last = digits.substring(7)
    return `+1 (${area}) ${first}-${last}`
  }

  // Format US numbers: +1 (XXX) XXX-XXXX
  if (digits.startsWith('1') && digits.length === 11) {
    const area = digits.substring(1, 4)
    const first = digits.substring(4, 7)
    const last = digits.substring(7)
    return `+1 (${area}) ${first}-${last}`
  }

  return normalized.normalized
}
