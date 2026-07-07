/**
 * Public-facing legal entity and geography — footer copyright only.
 * Consumer brand remains "Bornfidis" / "Bornfidis Provisions" in nav, headlines, and logo.
 */
export const BRAND_LEGAL = {
  /** Legal entity line for copyright (DBA). */
  companyLegalLine: 'Bornfidis Sportswear LLC, DBA Bornfidis Provisions',
  /** Consumer-facing trade name. */
  tradeName: 'Bornfidis Provisions',
  /** Short geography line — both operating roots, not a single city. */
  locationsLine: 'Vermont · Jamaica',
  email: 'hello@bornfidis.com',
} as const

export function brandCopyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND_LEGAL.companyLegalLine} · ${BRAND_LEGAL.locationsLine}`
}
