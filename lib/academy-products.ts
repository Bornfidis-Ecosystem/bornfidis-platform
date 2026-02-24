/**
 * Phase A — Academy product catalog
 * Products are referenced by slug. Stripe Price IDs are set in env or here.
 */

export type AcademyCategory =
  | 'Business Foundations'
  | 'Agri & Marketplace'
  | 'Service Systems'
  | 'Foundations'
  | 'Farming'
  | 'Contracting'
  | 'Culinary'

export type AcademyProductType = 'DOWNLOAD' | 'COURSE' | 'BUNDLE'

export interface AcademyProduct {
  slug: string
  title: string
  /** Optional tagline shown below title */
  subtitle?: string
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
  /** Who this product is for (display / filtering) */
  targetAudience?: string[]
  /** What learners will achieve */
  learningOutcomes?: string[]
  /** What's included in the purchase */
  whatIsIncluded?: string[]
}

const CATEGORIES: AcademyCategory[] = [
  'Business Foundations',
  'Agri & Marketplace',
  'Service Systems',
  'Foundations',
  'Farming',
  'Contracting',
  'Culinary',
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
  // ——— Manuals (private storage; secure download after purchase) ———
  {
    slug: 'regenerative-enterprise-foundations',
    title: 'Regenerative Enterprise Foundations™',
    subtitle: 'A Structured Operating System for Jamaican Entrepreneurs',
    description:
      '60-page discipline manual providing systems, frameworks, and rhythms to transform chaotic hustle into sustainable enterprise. Includes: Pricing With Dignity framework (Cost + Margin + Buffer), 4-layer revenue structure, weekly operating rhythm (Monday/Wednesday/Friday checkpoints), parish authority model, reputation covenant, 90-Day Builder Covenant, and 7 ready-to-use templates. Digital PDF delivery. Lifetime access and updates.',
    type: 'DOWNLOAD',
    priceDisplay: '$39',
    priceCents: 3900,
    category: 'Foundations',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE ?? '',
    image: '/academy/covers/regenerative-enterprise-foundations.png',
    downloadUrl: '/api/academy/download/regenerative-enterprise-foundations',
    targetAudience: [
      'Jamaican Entrepreneurs',
      'Taxi Operators',
      'Contractors',
      'Vendors',
      'Boutique Owners',
      'Digital Creators',
      'Agri-Processors',
      'Restaurant Owners',
    ],
    learningOutcomes: [
      'Implement the Cost + Margin + Buffer pricing formula',
      'Build a four-layer income structure (primary, secondary, buffer, emergency reserve)',
      'Establish weekly operating rhythm (Monday/Wednesday/Friday checkpoints)',
      'Dominate your parish before expanding nationally',
      'Protect long-term reputation over short-term gain',
      'Complete the 90-Day Builder Covenant',
    ],
    whatIsIncluded: [
      '60-page comprehensive manual (PDF)',
      '7 ready-to-use templates (Pricing Calculator, Revenue Structure Worksheet, Weekly Rhythm Checklists, Parish Stage Assessment, Reputation Review, 90-Day Progress Tracker)',
      '90-Day Builder Covenant with weekly tracker',
      'Lifetime access and updates',
    ],
  },
  {
    slug: 'regenerative-farmer-blueprint',
    title: 'Regenerative Farmer Blueprint',
    subtitle: 'A Structured Operating System for Jamaican Farmers',
    description:
      '60-page discipline manual covering soil regeneration, crop planning, market access, and financial sustainability. Includes: Soil health assessment framework, crop rotation planner (12-month calendar), regenerative certification roadmap, pricing calculator (cost + margin + dignity), market access strategy, and 10 ready-to-use templates for farm operations. Digital PDF delivery. Lifetime access and updates.',
    type: 'DOWNLOAD',
    priceDisplay: '$49',
    priceCents: 4900,
    category: 'Farming',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_FARMER ?? '',
    image: '/academy/covers/regenerative-farmer-blueprint.png',
    downloadUrl: '/api/academy/download/regenerative-farmer-blueprint',
    targetAudience: [
      'Portland Farmers',
      'St. Elizabeth Farmers',
      'Manchester Farmers',
      'Small-Scale Farmers',
      'Regenerative Farmers',
      'Agri-Entrepreneurs',
    ],
    learningOutcomes: [
      'Plan crops based on Jamaica climate and market demand',
      'Access parish markets and build direct chef relationships',
      'Calculate sustainable prices using Cost + Margin + Buffer formula',
      'Implement weekly farm operations rhythm',
      'Prepare for marketplace participation',
      'Build farm-level financial discipline',
    ],
    whatIsIncluded: [
      '60-page comprehensive manual (PDF)',
      'Crop Planning Worksheet (Jamaica climate focused)',
      'Parish Market Access Guide',
      'Direct Chef Outreach Script (WhatsApp ready)',
      'Pricing & Margin Protection Template',
      'Weekly Farm Operations Planner',
      'Marketplace Readiness Checklist',
      'Lifetime access and updates',
    ],
  },
  {
    slug: 'vermont-contractor-foundations',
    title: 'Vermont Contractor Foundations™',
    subtitle: 'A Structured Operating System for Vermont Contractors',
    description:
      '60-page discipline manual providing systems, frameworks, and rhythms for sustainable contracting business. Includes: Project estimation framework (materials + labor + buffer), weekly operating rhythm (Monday/Wednesday/Friday checkpoints), client communication templates, seasonal planning guide, reputation covenant, and 8 ready-to-use templates for contracts, invoices, and project management. Digital PDF delivery. Lifetime access and updates.',
    type: 'DOWNLOAD',
    priceDisplay: '$49',
    priceCents: 4900,
    category: 'Contracting',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_VERMONT_CONTRACTOR ?? '',
    image: '/academy/covers/vermont-contractor-foundations.png',
    downloadUrl: '/api/academy/download/vermont-contractor-foundations',
    targetAudience: [
      'Vermont Contractors',
      'Carpenters',
      'Electricians',
      'Plumbers',
      'HVAC Technicians',
      'Roofers',
      'Excavators',
      'Landscapers',
    ],
    learningOutcomes: [
      'Bid jobs using Cost + Labor Burden + Overhead + Margin + Contingency formula',
      'Build revenue structure with winter income stream',
      'Establish weekly operating rhythm (Monday/Wednesday/Friday checkpoints)',
      'Dominate your county before expanding regionally',
      'Protect long-term reputation over short-term gain',
      'Complete the 90-Day Contractor Covenant',
    ],
    whatIsIncluded: [
      '60-page comprehensive manual (PDF)',
      '8 ready-to-use templates (Bidding Calculator, Revenue Structure Worksheet, Weekly Rhythm Checklists, Territory Stage Assessment, Reputation Review, 90-Day Progress Tracker, Labor Burden Calculator, Payment Terms Contract Language)',
      '90-Day Contractor Covenant with weekly tracker',
      'Lifetime access and updates',
    ],
  },
  {
    slug: 'jamaican-chef-enterprise-system',
    title: 'Jamaican Chef Enterprise System™',
    subtitle: 'A Structured Operating System for Jamaican Chefs',
    description:
      '70-page comprehensive manual covering menu design, kitchen operations, cost management, and business scaling. Includes: Menu engineering framework (cost + creativity + culture), kitchen efficiency systems, staff management templates, catering business model, farm-to-table sourcing guide, and 12 ready-to-use templates for recipes, costing, inventory, and marketing. Digital PDF delivery. Lifetime access and updates.',
    type: 'DOWNLOAD',
    priceDisplay: '$79',
    priceCents: 7900,
    category: 'Culinary',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_JAMAICAN_CHEF ?? '',
    image: '/academy/covers/jamaican-chef-enterprise-system.png',
    downloadUrl: '/api/academy/download/jamaican-chef-enterprise-system',
    targetAudience: [
      'Jamaican Chefs',
      'Caterers',
      'Private Chefs',
      'Restaurant Owners',
      'Hotel Chefs',
      'Culinary School Graduates',
    ],
    learningOutcomes: [
      'Build direct farmer relationships to reduce food costs by 50-60%',
      'Calculate catering event costs and set profitable prices',
      'Cost every menu item and optimize menu profitability',
      'Structure supplier agreements with redundancy and reliability enforcement',
      'Position your brand for premium pricing and market authority',
      'Complete the 90-Day Kitchen Covenant',
    ],
    whatIsIncluded: [
      '70-page comprehensive manual (PDF)',
      '6 ready-to-use templates (Farmer Identification & Outreach, Supplier Agreement & Performance Tracking, Event Cost Calculation & Pricing, Plate Cost Calculation & Menu Profitability, Brand Positioning, 90-Day Kitchen Covenant Tracker)',
      'WhatsApp-ready farmer outreach scripts',
      'Price communication scripts for handling objections',
      'Lifetime access and updates',
    ],
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
