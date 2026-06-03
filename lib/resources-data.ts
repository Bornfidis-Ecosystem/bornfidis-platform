/**
 * Passive income resources — templates, lessons, services
 * First 5 Bornfidis templates + Starter Pack bundle.
 */

export type ResourceAudience =
  | 'Farmer'
  | 'Chef'
  | 'Educator'
  | 'Coordinator'
  | 'Community builder'
  | 'Youth apprentice'

export interface Template {
  slug: string
  name: string
  for: ResourceAudience[]
  problem: string
  price: number
  /** Legacy / internal */
  priceRange?: string
  /** Display: e.g. "JMD $1,500 (or USD $10)" or "FREE" */
  priceDisplay: string
  isFree?: boolean
  purpose?: string
  /** Bundle only: e.g. "Save ~25% vs buying individually" */
  valueNote?: string
  /** Pill label: e.g. "Farmer", "Farmer • Chef", "All Roles" */
  tag: string
  /** Optional: "Also useful for: X • Y" */
  alsoUsefulFor?: string
  /** For "All Roles": small subtext e.g. "Farmer • Chef • Educator • Partner" */
  tagSubtext?: string
  icon?: string
  includes?: string[]
  whyItSells?: string
  isBundle?: boolean
}

/** Same on all template cards */
export const TEMPLATE_CARD_FOOTER =
  'Payment shown before download · No subscriptions · Pilot pricing (subject to grow with value)'

export interface Lesson {
  slug: string
  title: string
  outcome: string
  duration: string
  price: number
  previewSeconds?: number
}

export const TEMPLATES: Template[] = [
  {
    slug: 'farmer-intake-profile',
    name: 'Farmer Intake & Profile Sheet',
    tag: 'Farmer',
    alsoUsefulFor: 'Coordinator',
    icon: '🌱',
    for: ['Farmer'],
    problem:
      'Create a clear, professional profile so buyers and partners understand what you grow and your capacity.',
    price: 0,
    priceDisplay: 'FREE',
    isFree: true,
    purpose: 'Trust-builder + easy entry into the ecosystem.',
    includes: [
      'Name, parish, farm size',
      'Crops grown & seasonality',
      'Weekly capacity',
      'Contact & WhatsApp',
      'Notes section (quality, reliability)',
    ],
    whyItSells:
      'Farmers can finally present themselves professionally.',
  },
  {
    slug: 'produce-pricing-calculator',
    name: 'Produce Pricing Calculator',
    tag: 'Farmer',
    alsoUsefulFor: 'Youth Apprentice',
    icon: '💰',
    for: ['Farmer', 'Coordinator'],
    problem:
      'Know the minimum price you should accept so you don’t sell at a loss.',
    price: 10,
    priceDisplay: 'JMD $1,500 (or USD $10)',
    purpose: 'Protects farmers from underpricing; instant value.',
    includes: [
      'Cost inputs (labor, transport, inputs)',
      'Suggested minimum price',
      'Margin guidance',
      '"Do not sell below this" line',
    ],
    whyItSells: 'Everyone struggles with pricing. This gives confidence.',
  },
  {
    slug: 'chef-farmer-order-agreement',
    name: 'Chef–Farmer Order Agreement',
    tag: 'Farmer • Chef',
    icon: '🤝',
    for: ['Farmer', 'Chef'],
    problem:
      'A simple agreement that sets expectations on price, delivery, and payment—no legal jargon.',
    price: 15,
    priceDisplay: 'JMD $2,000 (or USD $15)',
    purpose: 'Prevents disputes; clear expectations for both sides.',
    includes: [
      'Product & quantity',
      'Price & payment timing',
      'Delivery expectations',
      'Simple cancellation rules',
      'Signature section (no legal jargon)',
    ],
    whyItSells: 'People want clarity without lawyers.',
  },
  {
    slug: 'whatsapp-onboarding-scripts',
    name: 'WhatsApp Onboarding Script Pack',
    tag: 'Coordinator',
    alsoUsefulFor: 'Educator • Partner',
    icon: '📲',
    for: ['Coordinator', 'Community builder'],
    problem:
      'Ready-to-send WhatsApp messages to invite, onboard, and welcome people professionally.',
    price: 7,
    priceDisplay: 'JMD $1,000 (or USD $7)',
    purpose:
      'Helps coordinators, educators, and partners onboard professionally.',
    includes: [
      'First contact message',
      'Follow-up message',
      'Approval message',
      'Gentle rejection message',
      'Group welcome message',
    ],
    whyItSells:
      'People hate writing these messages but use WhatsApp daily.',
  },
  {
    slug: 'regenerative-farm-activity-log',
    name: 'Regenerative Farm Activity Log',
    tag: 'Farmer',
    alsoUsefulFor: 'Youth Apprentice',
    icon: '📓',
    for: ['Farmer', 'Youth apprentice'],
    problem:
      'Track farm work, inputs, and harvests to stay organized and show progress.',
    price: 10,
    priceDisplay: 'JMD $1,500 (or USD $10)',
    purpose: 'Simple records for consistency, learning, and credibility.',
    includes: [
      'Daily/weekly farm tasks',
      'Inputs used',
      'Observations',
      'Yield notes',
      'Reflection section',
    ],
    whyItSells:
      'Useful for grants, training, and self-improvement.',
  },
  {
    slug: 'starter-pack',
    name: 'Bornfidis Starter Pack (All Tools)',
    tag: 'All Roles',
    tagSubtext: 'Farmer • Chef • Educator • Partner',
    icon: '🎁',
    for: ['Farmer', 'Chef', 'Coordinator', 'Community builder'],
    problem:
      'All five tools in one download to help you farm, sell, and coordinate with confidence.',
    price: 35,
    priceDisplay: 'JMD $5,000 (or USD $35)',
    valueNote: 'Save ~25% vs buying individually.',
    includes: [
      'All 5 templates',
      'One simple download',
      'Clear instructions',
    ],
    whyItSells: 'Feels generous, not expensive.',
    isBundle: true,
  },
]

export const LESSONS: Lesson[] = [
  {
    slug: 'price-your-crops-confidently',
    title: 'How to price your crops confidently',
    outcome: 'Set fair prices that work for you and buyers.',
    duration: '~8 min',
    price: 10,
    previewSeconds: 45,
  },
  {
    slug: 'working-with-chefs-without-stress',
    title: 'Working with chefs without stress',
    outcome: 'Clear communication and expectations.',
    duration: '~7 min',
    price: 10,
    previewSeconds: 60,
  },
  {
    slug: 'preparing-for-opportunities-grants',
    title: 'Preparing for opportunities & grants',
    outcome: 'Get ready before applications open.',
    duration: '~10 min',
    price: 12,
    previewSeconds: 45,
  },
]

export const SERVICES_INTRO =
  'Light, practical help with forms, applications, and setup. No pressure—we help when you’re ready.'

export const SERVICE_ITEMS = [
  { title: 'Form filling support', for: 'Farmers, chefs, educators' },
  { title: 'Grant / application prep', for: 'Anyone applying for funding' },
  { title: 'Business setup guidance', for: 'New or informal businesses' },
]
