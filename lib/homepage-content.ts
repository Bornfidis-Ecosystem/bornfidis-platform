/**
 * Homepage copy & structure — editorial route only (`/` → HomeEditorial).
 * Vermont-first operations; Jamaica via partner intake (not on-site promise).
 *
 * Note: `SIGNATURE_EXPERIENCE` below is shared with `/private-dining`.
 * Homepage-only signature/inclusions copy lives in `HOME_*` constants so Phase 1
 * guest IA does not rewrite the private-dining page.
 */
import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { PHASE1_CTA } from '@/lib/phase1-marketing'

/** Homepage hero — private dining front door (Fall–Winter 2026). */
export const HOME_GUEST_HERO = {
  eyebrow: 'Private Dining in Vermont',
  headline: 'Your evening. Beautifully handled.',
  body:
    'A Jamaican–Vermont private dining experience served in your home, chalet, or retreat. Chef Brian and the Bornfidis team handle the food, service, and kitchen cleanup so you can remain present with your guests.',
  primaryCta: { label: 'Check Your Date', href: '/book' },
  secondaryCta: { label: 'Explore the Experience', href: '/private-dining' },
  trustLine: 'Experiences from $1,200 · Vermont and select New England locations',
  photoSrc: bornfidisPhotos.table.vermontCabin,
  photoAlt: 'A Bornfidis private dining table set inside a Vermont log cabin',
  caption: 'Chef-led hospitality at your table.',
} as const

/** Emotional guest journey — overview + how the evening feels. */
export const HOME_EXPERIENCE_JOURNEY = {
  eyebrow: 'The experience',
  headline: 'You host. We carry the evening.',
  lead:
    'Bornfidis Provisions brings chef-led private dining to your space—warm, intentional, and designed so you stay with your guests.',
  steps: [
    'We arrive and prepare the space.',
    'Jamaican heritage meets Vermont ingredients.',
    'Each course is served with warmth and intention.',
    'Signature tableside moments bring the table together.',
    'We leave the kitchen clean.',
  ],
} as const

/**
 * Homepage signature positioning only.
 * Do not replace `SIGNATURE_EXPERIENCE` (used by `/private-dining`).
 */
export const HOME_SIGNATURE_EXPERIENCE = {
  name: "The Chef's Passage",
  eyebrow: 'Signature experience',
  tagline:
    'A chef-led journey from the Caribbean to Vermont, told through food and generous hospitality.',
  authority: 'Luxury-ship training. Your table.',
  description:
    "Thirteen years of luxury hospitality at sea, brought to your Vermont table. The Chef's Passage is Bornfidis's signature private dining experience—seasonal courses rooted in Jamaican heritage and Vermont ingredients, served by Chef Brian and the Bornfidis team in your home, chalet, or retreat.",
  priceFraming:
    'Experiences from $1,200 in Vermont — final quote based on guest count and menu selections.',
  ctaLabel: 'Check Your Date',
  ctaHref: '/book',
  photoSrc: bornfidisPhotos.food.guestPlatedCourse,
  photoAlt: 'A Bornfidis private dining course — plated with seasonal vegetables and sauce',
} as const

/** Inclusions and clear boundaries for the homepage. */
export const HOME_INCLUSIONS = {
  eyebrow: 'What is included',
  headline: 'Handled with care—and clear boundaries.',
  items: [
    'Menu planning within the selected seasonal experience',
    'Ingredients and standard culinary equipment',
    'Onsite preparation',
    'Tableside or family-style service, depending on the experience',
    'Standard kitchen cleanup',
  ],
  boundary:
    'Specialty rentals, extensive tablescapes, travel outside the core service area, premium ingredient upgrades, and additional staffing are quoted separately.',
  dietary:
    'Tell us about allergies and dietary needs during your inquiry. We will confirm what can be safely accommodated before your booking is finalized.',
} as const

/** Shared with `/private-dining` — leave structure stable; homepage uses `HOME_SIGNATURE_EXPERIENCE`. */
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

/** Legacy PD-first hero kept for private-dining surfaces; homepage uses HOME_GUEST_HERO. */
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
  eyebrow: 'Provisions',
  headline: 'A taste to carry home.',
  body:
    'Selected Bornfidis provisions may be included as guest gifts or requested in small batches when available—an extension of the evening, not a separate destination.',
  href: '/provisions',
  requestHref: PHASE1_CTA.requestProduct.href,
  linkLabel: 'View provisions',
  requestLabel: 'Request a small batch',
  image: '/images/provisions/provisions-gift-basket.jpg',
  imageAlt: 'Bornfidis Guest Welcome Package — four provisions in a wicker basket',
} as const

export const HOME_FINAL_CTA = {
  eyebrow: 'Fall–Winter 2026',
  title: 'Ready to check your date?',
  body:
    'Share your gathering details and we will confirm availability for chef-led private dining in Vermont and select New England locations.',
  primaryCta: { label: 'Check Your Date', href: '/book' },
  secondaryCta: { label: 'Explore the Experience', href: '/private-dining' },
} as const

/** Orphan teaser component support — not rendered on Phase 1 homepage. */
export const JOURNAL_HOME_TEASER = {
  eyebrow: 'Journal',
  headline: 'Notes from the table — hospitality, place, and the craft of gathering.',
  href: '/journal',
  linkLabel: 'Read the journal',
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

/**
 * Homepage guest-experience moment — visual only.
 * Direct quotations / named attribution stay on /book and /private-dining
 * until written homepage permission is definitively recorded.
 */
export const FEATURED_GUEST_MOMENT = {
  eyebrow: 'The moment at the table',
  headline: 'Hospitality guests remember.',
  body:
    'The courses matter. So does the feeling around the table—the welcome, the pacing, the conversation, and the moment everyone becomes fully present.',
  momentLabel: 'At the table',
  imageSrc: bornfidisPhotos.food.guestPlatedChicken,
  imageAlt: 'A Bornfidis private dining course plated with herbs and sauce',
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
