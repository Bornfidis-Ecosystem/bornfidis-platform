/**
 * Public-facing legal entity and geography.
 * Consumer brand remains "Bornfidis" in nav/logo; DBAs named on service surfaces.
 *
 * Legal entity: Bornfidis Sportswear LLC
 * Assumed names / DBAs: Bornfidis Provisions, Bornfidis Digital Studio
 *
 * Wording that still needs counsel/founder sign-off: see LEGAL_REVIEW_REQUIRED.md
 */
export const BRAND_LEGAL = {
  /** LLC that owns the DBAs. */
  legalEntity: 'Bornfidis Sportswear LLC',
  /** Umbrella public brand. */
  umbrellaName: 'Bornfidis',
  provisionsDba: 'Bornfidis Provisions',
  digitalStudioDba: 'Bornfidis Digital Studio',
  /**
   * Copyright line for footer (brand-friendly).
   * Prefer assumed-name language over "DBA" for guest-facing surfaces.
   */
  companyLegalLine:
    'Bornfidis Provisions and Bornfidis Digital Studio are assumed names of Bornfidis Sportswear LLC',
  /** @deprecated Prefer companyLegalLine — kept for temporary call sites. */
  tradeName: 'Bornfidis Provisions',
  locationsLine: 'Vermont · Jamaica',
  email: 'hello@bornfidis.com',
} as const

export function brandCopyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND_LEGAL.umbrellaName}. ${BRAND_LEGAL.companyLegalLine}.`
}

export function brandLocationsLine(): string {
  return BRAND_LEGAL.locationsLine
}
