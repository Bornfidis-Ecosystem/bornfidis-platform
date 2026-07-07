/**

 * Phase 1 marketing constants — single source for public nav, footer, and product names.

 * Bornfidis Provisions & Private Dining (Vermont-first, guest path).

 */



export const PHASE1_NAV_LINKS = [

  { href: '/private-dining', label: 'Private Dining' },

  { href: '/provisions', label: 'Provisions' },

  { href: '/our-story', label: 'Our Story' },

  { href: '/contact', label: 'Contact' },

] as const



/** Footer-only links — not in main nav */

export const PHASE1_FOOTER_LINKS = [

  { href: '/journal', label: 'Journal' },

  { href: '/partners', label: 'Work with Bornfidis' },

] as const



export const PHASE1_PRIMARY_PRODUCTS = [

  {

    id: 'maple-jerk-rub',

    name: 'Maple Jerk Rub',

    categoryLabel: 'Dry Spice Rub',

    href: '/provisions#maple-jerk-rub',

  },

  {

    id: 'maple-escovitch',

    name: 'Maple Escovitch',

    categoryLabel: 'Finishing Sauce',

    href: '/provisions#maple-escovitch',

  },

  {

    id: 'green-seasoning',

    name: 'Green Seasoning',

    categoryLabel: 'Fresh Seasoning',

    href: '/provisions#green-seasoning',

  },

  {

    id: 'sorrel-gastrique',

    name: 'Sorrel Gastrique',

    categoryLabel: 'Finishing Sauce',

    href: '/provisions#sorrel-gastrique',

  },

] as const



export const PHASE1_CTA = {

  bookNow: { label: 'BOOK NOW', href: '/book' },

  bookYourTable: { label: 'Book Your Table', href: '/book' },

  bookPrivateDining: {

    label: 'Book a Private Dining Experience',

    href: '/book',

    shortLabel: 'Book Private Dining',

  },

  requestProduct: { label: 'Request a Product', href: '/contact?service=product' },

  bookCookingClass: {
    label: 'Inquire About a Cooking Class',
    href: '/contact?service=cooking-class',
  },

  contactBornfidis: { label: 'Contact Bornfidis', href: '/contact' },

  workWithBornfidis: { label: 'Work with Bornfidis', href: '/partners' },

  jamaicaPartnerInquiry: {

    label: 'Jamaica Private Dining Inquiry',

    href: '/contact?service=jamaica-partner',

  },

} as const



/** Maps `?service=` on /contact to form option values. */

export const PHASE1_CONTACT_SERVICE_PARAM: Record<string, string> = {

  product: 'Product / Gourmet Inquiry',

  'cooking-class': 'Cooking Class',

  'jamaica-partner': 'Jamaica Private Dining (partner-led)',

  partners: 'Partners / Investors / Consulting',

}



export const PHASE1_CONVERSION_ACTIONS = [

  PHASE1_CTA.bookPrivateDining,

  PHASE1_CTA.requestProduct,

  PHASE1_CTA.bookCookingClass,

  PHASE1_CTA.contactBornfidis,

] as const



export const SIGNATURE_PRODUCT_NAME = "The Chef's Passage"


