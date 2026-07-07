/**
 * Homepage copy & structure — editorial route only (`/` → HomeEditorial).
 * Vermont-first operations; Jamaica via partner intake (not on-site promise).
 */
import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { PHASE1_CTA } from '@/lib/phase1-marketing'

export const SIGNATURE_EXPERIENCE = {
  name: "The Chef's Passage",
  eyebrow: 'Signature experience',
  tagline: 'A five-course journey from the Caribbean to Vermont, told through food.',
  description:
    "Thirteen years of luxury hospitality at sea, brought to your Vermont table. The Chef's Passage is Bornfidis's signature private dining experience — a five-course tasting menu built around Jamaican heritage and Vermont ingredients, served tableside by Chef Brian and the Bornfidis team in your home, venue, or backyard.",
  includes: [
    'Five-course tasting menu, built around seasonal Vermont ingredients and Jamaican technique',
    'Tableside service, including the signature crème brûlée finish',
    'Full setup, service, and cleanup — you host, we handle the rest',
    'Custom menu consultation before the event',
  ],
  priceFraming:
    'Starting at $1,200 in Vermont — final quote based on guest count and menu selections. Jamaica inquiries welcome via our partner network.',
  jamaicaNote: 'Jamaica private dining — request a quote (partner-led)',
  jamaicaContactHref: '/contact?service=jamaica-partner',
  ctaLabel: "Book The Chef's Passage",
  ctaHref: PHASE1_CTA.bookYourTable.href,
  photoSrc: bornfidisPhotos.food.guestPlatedCourse,
  photoAlt: 'A Bornfidis private dining course — plated with seasonal vegetables and sauce',
} as const

export const HERO = {
  taglineLine1: 'Caribbean Heart.',
  taglineLine2: 'Vermont Hands.',
  outcomeLine:
    'Host an unforgettable private dining experience — chef-led, fully hosted, without lifting a finger.',
  servingNote:
    'Serving Vermont now. Jamaica and select travel engagements by advance request.',
  guestScoreDetail: '97.80 guest satisfaction average from luxury hospitality appraisals.',
  primaryCta: PHASE1_CTA.bookYourTable,
  secondaryLinks: [
    { label: 'Explore Provisions', href: '/provisions' },
    { label: 'Inquire About a Cooking Class', href: PHASE1_CTA.bookCookingClass.href },
  ],
} as const

export const PROVISIONS_HOME_STRIP = {
  eyebrow: 'From the pantry',
  headline:
    'Maple Jerk Rub, Green Seasoning, Sorrel Gastrique, and Maple Escovitch — request a batch when orders align.',
  href: '/provisions',
  requestHref: PHASE1_CTA.requestProduct.href,
  linkLabel: 'View all provisions',
  requestLabel: 'Request a batch',
  image: '/images/provisions/provisions-gift-basket.jpg',
  imageAlt: 'Bornfidis Guest Welcome Package — four provisions in a wicker basket',
} as const

export type HomeStat = {
  value: string
  valueSuffix?: string
  label: string
  detail?: string
  animateTo?: number
  animateDecimals?: number
}

export const ROYAL_CARIBBEAN_HOME_STATS: HomeStat[] = [
  {
    value: '13',
    valueSuffix: ' Years',
    label: 'Royal Caribbean',
    detail: '2006–2020 · galley to dining room',
    animateTo: 13,
  },
  {
    value: '97',
    valueSuffix: '.80',
    label: 'Guest satisfaction',
    detail: 'Guest satisfaction average from luxury hospitality appraisals',
    animateTo: 97.8,
    animateDecimals: 2,
  },
  {
    value: '7',
    label: 'Ships served',
    detail: 'Jewel · Navigator · Explorer · Freedom · Independence · Harmony · Azamara',
    animateTo: 7,
  },
  {
    value: '10',
    valueSuffix: '-Year',
    label: 'Service award',
    detail: 'December 2016 · RC recognition',
    animateTo: 10,
  },
]

export const ROYAL_CARIBBEAN_HOME_CREDENTIALS = [
  'Grand Hyatt Vail',
  'Embassy & government catering',
  'Jamaica Observer Food Awards recognition',
] as const

export const ROYAL_CARIBBEAN_PROGRESSION =
  'Culinary Trainee → Chef de Partie-1 → Level 5 Waiter Lead & Host'

/** Set `pendingGuestApproval` false once Samantha confirms name/photo use. */
export const FEATURED_GUEST_MOMENT = {
  pendingGuestApproval: true,
  eyebrow: 'Featured guest moment',
  guestName: 'Samantha',
  eventDetail: 'Private dining · April 22, 2026 · 5 guests',
  quote:
    'The tableside crème brûlée was the moment everyone stopped talking — five guests, one table, and a chef who made the evening feel effortless.',
  momentLabel: 'Plated to the table',
  imageSrc: bornfidisPhotos.food.guestPlatedChicken,
  imageAlt: 'Bornfidis private dining — a guest course plated with herbs and sauce',
} as const

/** Used on /our-story — not on homepage. */
export const PHILOSOPHY_HOME = {
  eyebrow: 'Why Bornfidis',
  quote:
    'I am not building a business. I am building a table — large enough for the generations that come after me to sit at.',
  attribution: 'Brian Maylor — Founder',
} as const

/** Used on /our-story — not on homepage. */
export const MEET_BRIAN_HOME = {
  eyebrow: 'Meet Brian',
  headline: 'Thirteen years at sea. One table at a time.',
  body:
    'Brian Maylor is a Royal Caribbean veteran, private chef, and founder of Bornfidis — rooted in Portland Parish, Jamaica and based in Cavendish, Vermont. He learned the galley and the dining room before bringing both disciplines to your table.',
  portraitSrc: bornfidisPhotos.founder.suitPortrait,
  portraitAlt: 'Brian Maylor — Founder & Private Chef, Bornfidis Provisions',
  storyHref: '/our-story',
  storyLabel: 'Read the full story',
} as const

export const SERVICE_REGIONS = [
  { value: 'vermont-northeast', label: 'Vermont / Northeast' },
  { value: 'new-jersey', label: 'New Jersey' },
  { value: 'jamaica-partner', label: 'Jamaica (partner inquiry)' },
] as const

export const JAMAICA_PARTNER_HELPER =
  "We'll connect you with our Jamaica partner team. Brian does not personally service all Jamaica requests."
