import type { StripeDivision } from '@/lib/stripe'

/** Human labels for multi-account Stripe routing (admin UI). */
export function stripeDivisionLabel(division: string | null | undefined): string {
  switch ((division || '').trim().toLowerCase()) {
    case 'provisions':
      return 'Provisions'
    case 'digital-studio':
      return 'Digital Studio'
    case 'sportswear':
      return 'Sportswear'
    default:
      return division?.trim() ? division.trim() : 'Unlabeled'
  }
}

export function stripeDivisionShortHint(division: string | null | undefined): string {
  switch ((division || '').trim().toLowerCase()) {
    case 'provisions':
      return 'Bornfidis Provisions Stripe account'
    case 'digital-studio':
      return 'Bornfidis Digital Studio Stripe account'
    case 'sportswear':
      return 'Sportswear is not wired to getStripeClient yet'
    default:
      return 'Stripe account not recorded on this row'
  }
}

export function isKnownStripeDivision(value: string): value is StripeDivision {
  return value === 'provisions' || value === 'digital-studio'
}
