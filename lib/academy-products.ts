/**
 * Phase A — Academy product catalog
 * Products are referenced by slug. Stripe Price IDs are set in env or here.
 */

export type AcademyCategory =
  | 'Business Foundations'
  | 'Agri & Marketplace'
  | 'Service Systems'

export type AcademyProductType = 'DOWNLOAD' | 'COURSE' | 'BUNDLE'

export interface AcademyProduct {
  slug: string
  title: string
  description: string
  /** DOWNLOAD = one-time asset; COURSE = structured course (protected route); BUNDLE = multiple items */
  type: AcademyProductType
  priceDisplay: string
  /** Price in cents for snapshot storage; 0 for free */
  priceCents: number
  category: AcademyCategory
  /** Stripe Price ID (e.g. price_xxx). Set via env NEXT_PUBLIC_STRIPE_ACADEMY_* or here. */
  stripePriceId: string
  /** Optional image URL (relative or absolute) */
  image?: string
  /** After purchase: link to download or asset */
  downloadUrl?: string
  /** After purchase: link to course / video (e.g. unlisted Vimeo) — used when type !== COURSE for external link */
  courseUrl?: string
}

const CATEGORIES: AcademyCategory[] = [
  'Business Foundations',
  'Agri & Marketplace',
  'Service Systems',
]

export const ACADEMY_CATEGORIES = CATEGORIES

/** All academy products. Stripe Price IDs can be overridden via env. */
export const ACADEMY_PRODUCTS: AcademyProduct[] = [
  // ——— Business Foundations ———
  {
    slug: 'llc-starter-kit',
    title: 'LLC Starter Kit',
    description: 'Forms, checklist, and steps to form and maintain your LLC.',
    type: 'DOWNLOAD',
    priceDisplay: '$29',
    priceCents: 2900,
    category: 'Business Foundations',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_LLC_STARTER ?? '',
    image: '/academy/llc-kit.png',
    downloadUrl: '/api/academy/download/llc-starter-kit',
  },
  {
    slug: 'pricing-strategy-blueprint',
    title: 'Pricing Strategy Blueprint',
    description: 'Set prices that win clients and protect your margin.',
    type: 'DOWNLOAD',
    priceDisplay: '$49',
    priceCents: 4900,
    category: 'Business Foundations',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_PRICING_BLUEPRINT ?? '',
    downloadUrl: '/api/academy/download/pricing-strategy-blueprint',
  },
  {
    slug: 'service-business-sop-pack',
    title: 'Service Business SOP Pack',
    description: 'Standard operating procedures for service businesses.',
    type: 'DOWNLOAD',
    priceDisplay: '$49',
    priceCents: 4900,
    category: 'Business Foundations',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_SOP_PACK ?? '',
    downloadUrl: '/api/academy/download/service-business-sop-pack',
  },
  // ——— Agri & Marketplace ———
  {
    slug: 'farmer-intake-kit',
    title: 'Farmer Intake Kit',
    description: 'Intake forms and profile templates for farmers.',
    type: 'DOWNLOAD',
    priceDisplay: 'FREE',
    priceCents: 0,
    category: 'Agri & Marketplace',
    stripePriceId: '', // FREE — use /api/academy/claim
    image: '/academy/farmer-intake.png',
    downloadUrl: '/resources/templates/farmer-intake-profile',
  },
  {
    slug: 'agri-processing-checklist',
    title: 'Agri-Processing Checklist',
    description: 'Checklist for safe and compliant agri-processing.',
    type: 'DOWNLOAD',
    priceDisplay: '$19',
    priceCents: 1900,
    category: 'Agri & Marketplace',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_AGRI_CHECKLIST ?? '',
    downloadUrl: '/api/academy/download/agri-processing-checklist',
  },
  {
    slug: 'proju-marketplace-vendor-kit',
    title: 'ProJu Marketplace Vendor Kit',
    description: 'Onboard and operate as a ProJu marketplace vendor.',
    type: 'DOWNLOAD',
    priceDisplay: '$39',
    priceCents: 3900,
    category: 'Agri & Marketplace',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_PROJU_VENDOR ?? '',
    downloadUrl: '/api/academy/download/proju-marketplace-vendor-kit',
  },
  // ——— Service Systems ———
  {
    slug: 'cleaning-business-launch-pack',
    title: 'Cleaning Business Launch Pack',
    description: 'Launch a cleaning business with contracts and checklists.',
    type: 'DOWNLOAD',
    priceDisplay: '$39',
    priceCents: 3900,
    category: 'Service Systems',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_CLEANING_LAUNCH ?? '',
    downloadUrl: '/api/academy/download/cleaning-business-launch-pack',
  },
  {
    slug: 'operator-onboarding-guide',
    title: 'Operator Onboarding Guide',
    description: 'Onboard new operators quickly and consistently.',
    type: 'COURSE',
    priceDisplay: '$29',
    priceCents: 2900,
    category: 'Service Systems',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_OPERATOR_GUIDE ?? '',
  },
  {
    slug: 'nj-vt-starter-framework',
    title: 'NJ + VT Starter Framework',
    description: 'Regulatory and operational starter framework for NJ & VT.',
    type: 'DOWNLOAD',
    priceDisplay: '$49',
    priceCents: 4900,
    category: 'Service Systems',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_NJ_VT ?? '',
    downloadUrl: '/api/academy/download/nj-vt-starter-framework',
  },
]

export function getAcademyProductBySlug(slug: string): AcademyProduct | undefined {
  return ACADEMY_PRODUCTS.find((p) => p.slug === slug)
}

export function getAcademyProductsByCategory(): Map<AcademyCategory, AcademyProduct[]> {
  const map = new Map<AcademyCategory, AcademyProduct[]>()
  for (const cat of CATEGORIES) {
    map.set(cat, ACADEMY_PRODUCTS.filter((p) => p.category === cat))
  }
  return map
}

/** TASK 6 — Upsell: suggested next product after one purchase (Complete Your Foundation) */
export const ACADEMY_UPSELL_SUGGESTION: Record<string, string> = {
  'llc-starter-kit': 'pricing-strategy-blueprint',
  'farmer-intake-kit': 'proju-marketplace-vendor-kit',
  'cleaning-business-launch-pack': 'operator-onboarding-guide',
  'proju-marketplace-vendor-kit': 'agri-processing-checklist',
  'pricing-strategy-blueprint': 'service-business-sop-pack',
}
