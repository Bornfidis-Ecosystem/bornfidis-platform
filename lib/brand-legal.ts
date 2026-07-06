/**
 * Public-facing legal entity and geography — single source for footer and forms.
 * LLC transition: Bornfidis Sportswear LLC → Born for This LLC.
 */
export const BRAND_LEGAL = {
  /** Legal entity (use in copyright and formal references). */
  companyName: 'Born for This LLC',
  /** Consumer-facing trade name. */
  tradeName: 'Bornfidis Provisions',
  /** Short geography line — both operating roots, not a single city. */
  locationsLine: 'Vermont · Jamaica',
  email: 'hello@bornfidis.com',
} as const

export function brandCopyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND_LEGAL.companyName} · ${BRAND_LEGAL.locationsLine}`
}
