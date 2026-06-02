/**
 * Phase 1 marketing constants — single source for public nav, footer, and product names.
 * Bornfidis Provisions & Private Dining (90-day revenue focus).
 */

export const PHASE1_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/private-dining', label: 'Private Dining' },
  { href: '/provisions', label: 'Provisions' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
] as const

export const PHASE1_PRIMARY_PRODUCTS = [
  {
    id: 'maple-jerk-rub',
    name: 'Maple Jerk Rub',
    categoryLabel: 'Dry Spice Rub',
    href: '/provisions',
  },
  {
    id: 'jerk-marinade',
    name: 'Jerk Marinade',
    categoryLabel: 'Wet Marinade',
    href: '/provisions',
  },
  {
    id: 'sorrel-gastrique',
    name: 'Sorrel Gastrique',
    categoryLabel: 'Finishing Sauce',
    href: '/provisions',
  },
  {
    id: 'green-seasoning',
    name: 'Green Seasoning',
    categoryLabel: 'Fresh Seasoning',
    href: '/provisions',
  },
] as const

export const PHASE1_CTA = {
  bookNow: { label: 'BOOK NOW', href: '/book' },
  bookPrivateDining: { label: 'Book Private Dining', href: '/book' },
  requestProduct: { label: 'Request a Product', href: '/contact' },
  bookCookingClass: { label: 'Book a Cooking Class', href: '/contact' },
  contactBornfidis: { label: 'Contact Bornfidis', href: '/contact' },
} as const
