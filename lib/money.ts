/**
 * Phase 3A: Money utility functions
 * Handles conversion between cents (database) and dollars (UI)
 */

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Convert dollars to cents (rounded)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Format money for display
 * @param cents - Amount in cents
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatMoney(cents: number, currency: string = 'USD'): string {
  const dollars = centsToDollars(cents)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(dollars)
}

/**
 * Format money without currency symbol (for inputs)
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "1,234.56")
 */
export function formatMoneyPlain(cents: number): string {
  const dollars = centsToDollars(cents)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Parse dollar string to cents
 * @param dollarString - String like "1234.56" or "$1,234.56"
 * @returns Cents (integer)
 */
export function parseDollarsToCents(dollarString: string): number {
  // Remove currency symbols and commas
  const cleaned = dollarString.replace(/[$,\s]/g, '')
  const dollars = parseFloat(cleaned) || 0
  return dollarsToCents(dollars)
}

/**
 * Format USD currency (alias for formatMoney with USD)
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatUSD(cents: number): string {
  return formatMoney(cents, 'USD')
}
