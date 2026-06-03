import { z } from 'zod'

/** Persisted checklist flags (payment / testimonial use source-of-truth fields on the booking). */
export const BOOKING_CHECKLIST_WRITABLE_KEYS = [
  'menuConfirmed',
  'dietaryConfirmed',
  'guestCountConfirmed',
  'arrivalTimeConfirmed',
  'locationConfirmed',
  'ingredientsSourced',
  'equipmentPacked',
] as const

export type BookingChecklistWritableKey = (typeof BOOKING_CHECKLIST_WRITABLE_KEYS)[number]

export const bookingChecklistWritableKeySchema = z.enum(BOOKING_CHECKLIST_WRITABLE_KEYS)

/** Human titles for activity log + UI (sentence case). */
export const BOOKING_CHECKLIST_ITEM_TITLES: Record<
  BookingChecklistWritableKey | 'depositReceived' | 'finalBalanceCollected' | 'testimonialRequested',
  string
> = {
  menuConfirmed: 'Menu confirmed',
  dietaryConfirmed: 'Dietary requirements confirmed',
  guestCountConfirmed: 'Guest count confirmed',
  arrivalTimeConfirmed: 'Arrival time confirmed',
  locationConfirmed: 'Location / venue confirmed',
  ingredientsSourced: 'Ingredients sourced',
  equipmentPacked: 'Equipment packed',
  depositReceived: 'Deposit received',
  finalBalanceCollected: 'Final balance collected',
  testimonialRequested: 'Testimonial requested',
}
