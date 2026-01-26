import { z } from 'zod'

export const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number is required'),
  eventDate: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }, 'Event date must be today or in the future'),
  eventTime: z.string().optional(),
  location: z.string().min(10, 'Location must be at least 10 characters'),
  guests: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  budgetRange: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
  // Honeypot field - should be empty
  website_url: z.string().max(0, 'Spam detected').optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

/**
 * Phase 3A: Quote validation schemas
 */

export const quoteItemSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new items
  booking_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  unit_price_cents: z.number().int().min(0, 'Unit price cannot be negative'),
  line_total_cents: z.number().int().min(0, 'Line total cannot be negative'),
  sort_order: z.number().int().min(0),
  created_at: z.string().optional(),
})

export const quoteDraftSchema = z.object({
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  tax_dollars: z.number().min(0, 'Tax cannot be negative').optional(),
  deposit_percent: z.number().min(0).max(100, 'Deposit cannot exceed 100%').optional(),
})

export type QuoteItemInput = z.infer<typeof quoteItemSchema>
export type QuoteDraftInput = z.infer<typeof quoteDraftSchema>

/**
 * Phase 3B: Quote Builder validation schemas
 */

export const quoteLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  booking_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  quantity: z.number().int().positive('Quantity must be positive'),
  unit_price_cents: z.number().int().min(0, 'Unit price cannot be negative'),
  sort_order: z.number().int().min(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const updateQuoteSummarySchema = z.object({
  quote_notes: z.string().optional().nullable(),
  deposit_percent: z.number().int().min(0).max(100, 'Deposit cannot exceed 100%'),
  tax_cents: z.number().int().min(0, 'Tax cannot be negative'),
  service_fee_cents: z.number().int().min(0, 'Service fee cannot be negative'),
  subtotal_cents: z.number().int().min(0, 'Subtotal cannot be negative'),
  total_cents: z.number().int().min(0, 'Total cannot be negative'),
  balance_amount_cents: z.number().int().min(0, 'Balance cannot be negative'),
  quote_status: z.enum(['draft', 'sent', 'accepted', 'declined']),
})

export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>
export type UpdateQuoteSummaryInput = z.infer<typeof updateQuoteSummarySchema>

/**
 * Phase 5A: Chef application validation schemas
 */

export const chefApplicationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number is required').optional(),
  bio: z.string().min(50, 'Bio must be at least 50 characters').optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_handle: z.string().optional(),
})

export type ChefApplicationInput = z.infer<typeof chefApplicationSchema>

/**
 * Phase 6A: Farmer application validation schemas
 */

export const farmerApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').optional(),
  location: z.string().min(10, 'Location must be at least 10 characters'),
  parish: z.string().optional(),
  country: z.string().default('Jamaica'),
  regenerative_practices: z.string().min(50, 'Please describe your regenerative practices (at least 50 characters)').optional(),
  certifications: z.array(z.string()).optional(),
  crops: z.array(z.string()).optional(),
  proteins: z.array(z.string()).optional(),
  processing_capabilities: z.array(z.string()).optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_handle: z.string().optional(),
})

export type FarmerApplicationInput = z.infer<typeof farmerApplicationSchema>

/**
 * Phase 6B: Ingredient validation schemas
 */

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['produce', 'fish', 'meat', 'dairy', 'spice', 'beverage']),
  unit: z.string().min(1, 'Unit is required'),
  regenerative_score: z.number().int().min(0).max(100).default(50),
  seasonality: z.string().optional(),
  notes: z.string().optional(),
  search_keywords: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
})

export const farmerIngredientSchema = z.object({
  farmer_id: z.string().uuid(),
  ingredient_id: z.string().uuid(),
  price_cents: z.number().int().min(0, 'Price cannot be negative'),
  availability: z.enum(['in_stock', 'limited', 'out_of_season']).default('in_stock'),
  certified: z.boolean().default(false),
  regenerative_practices: z.string().optional(),
  notes: z.string().optional(),
})

export const bookingIngredientSchema = z.object({
  booking_id: z.string().uuid(),
  ingredient_id: z.string().uuid(),
  farmer_id: z.string().uuid(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  price_cents: z.number().int().min(0, 'Price cannot be negative'),
  notes: z.string().optional(),
})

export type IngredientInput = z.infer<typeof ingredientSchema>
export type FarmerIngredientInput = z.infer<typeof farmerIngredientSchema>
export type BookingIngredientInput = z.infer<typeof bookingIngredientSchema>

/**
 * Phase 7A: Cooperative validation schemas
 */

export const cooperativeMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['farmer', 'chef', 'educator', 'builder', 'partner']),
  region: z.string().min(2, 'Region is required'),
  bio: z.string().optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_handle: z.string().optional(),
  farmer_id: z.string().uuid().optional(),
  chef_id: z.string().uuid().optional(),
})

export const cooperativeTrainingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  track: z.enum(['food', 'soil', 'faith', 'enterprise']),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  required_for_roles: z.array(z.enum(['farmer', 'chef', 'educator', 'builder', 'partner'])).optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  estimated_duration_minutes: z.number().int().positive().optional(),
  video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type CooperativeMemberInput = z.infer<typeof cooperativeMemberSchema>
export type CooperativeTrainingInput = z.infer<typeof cooperativeTrainingSchema>

/**
 * Phase 7B: Replication validation schemas
 */

export const replicationRegionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().optional(),
  region_description: z.string().optional(),
  leader_name: z.string().min(2, 'Leader name is required'),
  leader_email: z.string().email('Invalid email address'),
  leader_phone: z.string().optional(),
  leader_bio: z.string().optional(),
  leader_experience: z.string().optional(),
  impact_goal: z.string().optional(),
  target_communities: z.array(z.string()).optional(),
  expected_farmers: z.number().int().min(0).default(0),
  expected_chefs: z.number().int().min(0).default(0),
  capital_needed_cents: z.number().int().min(0).default(0),
  support_needed: z.array(z.string()).optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  social_media: z.record(z.any()).optional(),
})

export const impactInvestorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  region_interest: z.array(z.string()).optional(),
  capital_committed_cents: z.number().int().min(0).default(0),
  investment_type: z.enum(['grant', 'loan', 'equity', 'donation']).optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const replicationKitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  kit_type: z.enum(['chef', 'farm', 'market', 'housing', 'education']),
  version: z.string().default('1.0'),
  description: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  resources: z.record(z.any()).optional(),
  required_for_launch: z.boolean().default(false),
  prerequisites: z.array(z.string().uuid()).optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(false),
  estimated_completion_days: z.number().int().positive().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
})

export type ReplicationRegionInput = z.infer<typeof replicationRegionSchema>
export type ImpactInvestorInput = z.infer<typeof impactInvestorSchema>
export type ReplicationKitInput = z.infer<typeof replicationKitSchema>

/**
 * Phase 7C: Global Harvest & Kingdom Capital Engine validation schemas
 */

export const harvestMetricSchema = z.object({
  region_id: z.string().uuid().optional().nullable(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  food_tons: z.number().int().min(0).default(0),
  farmers_supported: z.number().int().min(0).default(0),
  chefs_deployed: z.number().int().min(0).default(0),
  meals_served: z.number().int().min(0).default(0),
  land_regenerated_acres: z.number().min(0).default(0),
  disciples_trained: z.number().int().min(0).default(0),
  community_events: z.number().int().min(0).default(0),
  scholarships_funded: z.number().int().min(0).default(0),
  notes: z.string().optional().nullable(),
})

export const kingdomFundSchema = z.object({
  region_id: z.string().uuid().optional().nullable(),
  fund_name: z.string().min(1, 'Fund name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  description: z.string().optional().nullable(),
  balance_cents: z.number().int().min(0).default(0),
  target_balance_cents: z.number().int().min(0).optional().nullable(),
  fund_type: z.enum(['general', 'scholarship', 'land', 'training', 'emergency']).default('general'),
  is_active: z.boolean().default(true),
})

export const impactTransactionSchema = z.object({
  fund_id: z.string().uuid(),
  source: z.enum(['booking', 'donation', 'investment', 'grant', 'transfer']),
  source_reference_id: z.string().uuid().optional().nullable(),
  amount_cents: z.number().int().min(1, 'Amount must be greater than 0'),
  transaction_type: z.enum(['credit', 'debit']),
  purpose: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export type HarvestMetricInput = z.infer<typeof harvestMetricSchema>
export type KingdomFundInput = z.infer<typeof kingdomFundSchema>
export type ImpactTransactionInput = z.infer<typeof impactTransactionSchema>

/**
 * Phase 8A: Legacy & Succession Engine validation schemas
 */

export const legacyLeaderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(['founder', 'elder', 'pastor', 'director', 'coordinator', 'mentor']),
  region: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  trained_at: z.string().optional().nullable(),
  ordained_at: z.string().optional().nullable(),
  succession_ready: z.boolean().default(false),
  succession_notes: z.string().optional().nullable(),
  mentor_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'emeritus', 'training', 'ordained']).default('active'),
})

export const legacyDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['vision', 'doctrine', 'operations', 'governance', 'finance', 'discipleship']),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  summary: z.string().optional().nullable(),
  version: z.string().default('1.0'),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(false),
  author_id: z.string().uuid().optional().nullable(),
  approved_by: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
})

export const prayerRequestSchema = z.object({
  submitted_by: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  region: z.string().optional().nullable(),
  request: z.string().min(10, 'Prayer request must be at least 10 characters'),
  is_public: z.boolean().default(true),
})

export const prayerAnswerSchema = z.object({
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  answered_by: z.string().uuid().optional().nullable(),
})

export type LegacyLeaderInput = z.infer<typeof legacyLeaderSchema>
export type LegacyDocumentInput = z.infer<typeof legacyDocumentSchema>
export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>
export type PrayerAnswerInput = z.infer<typeof prayerAnswerSchema>

/**
 * Phase 8B: Generational Wealth & Housing Covenant validation schemas
 */

export const housingProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  region: z.string().min(2, 'Region is required'),
  location_address: z.string().optional().nullable(),
  units_total: z.number().int().min(1, 'Must have at least 1 unit').default(0),
  units_occupied: z.number().int().min(0).default(0),
  units_available: z.number().int().min(0).default(0),
  land_owner: z.string().optional().nullable(),
  land_ownership_type: z.enum(['community', 'trust', 'cooperative', 'individual']).default('community'),
  trust_established: z.boolean().default(false),
  trust_name: z.string().optional().nullable(),
  trust_established_date: z.string().optional().nullable(),
  project_status: z.enum(['planning', 'development', 'construction', 'active', 'completed']).default('planning'),
  description: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
})

export const housingResidentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  family_size: z.number().int().min(1, 'Family size must be at least 1').default(1),
  project_id: z.string().uuid('Invalid project ID'),
  equity_cents: z.number().int().min(0).default(0),
  rent_cents: z.number().int().min(0).default(0),
  monthly_payment_cents: z.number().int().min(0).default(0),
  own_by_date: z.string().optional().nullable(),
  move_in_date: z.string().optional().nullable(),
  status: z.enum(['applied', 'approved', 'active', 'owner', 'moved_out']).default('applied'),
  application_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const legacyFundSchema = z.object({
  family_name: z.string().min(2, 'Family name is required'),
  region: z.string().optional().nullable(),
  balance_cents: z.number().int().min(0).default(0),
  purpose: z.enum(['housing', 'education', 'land', 'business', 'emergency']),
  fund_type: z.enum(['savings', 'trust', 'inheritance', 'scholarship']).default('savings'),
  target_balance_cents: z.number().int().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  beneficiary_name: z.string().optional().nullable(),
  beneficiary_relationship: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type HousingProjectInput = z.infer<typeof housingProjectSchema>
export type HousingResidentInput = z.infer<typeof housingResidentSchema>
export type LegacyFundInput = z.infer<typeof legacyFundSchema>

/**
 * Phase 10B: Launch & Storytelling Engine validation schemas
 */

export const storySubmissionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  author_name: z.string().min(2, 'Name is required'),
  author_email: z.string().email('Invalid email address').optional().nullable(),
  author_role: z.string().optional().nullable(),
  author_region: z.string().optional().nullable(),
  story_text: z.string().min(50, 'Story must be at least 50 characters'),
  video_url: z.string().url('Invalid URL').optional().nullable(),
  image_url: z.string().url('Invalid URL').optional().nullable(),
  category: z.enum(['testimony', 'impact', 'farmer', 'chef', 'community', 'partner']).default('testimony'),
})

export const pressKitSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional().nullable(),
  file_url: z.string().url('Invalid URL'),
  file_type: z.enum(['pdf', 'zip', 'doc']).default('pdf'),
  file_size_bytes: z.number().int().min(0).optional().nullable(),
  version: z.string().default('1.0'),
  is_active: z.boolean().default(true),
})

export const partnerInquirySchema = z.object({
  organization_name: z.string().min(2, 'Organization name is required'),
  contact_name: z.string().min(2, 'Contact name is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional().nullable(),
  organization_type: z.enum(['media', 'nonprofit', 'business', 'church', 'government', 'other']).optional().nullable(),
  partnership_interest: z.enum(['sponsorship', 'collaboration', 'media', 'distribution', 'other']).optional().nullable(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  website_url: z.string().url('Invalid URL').optional().nullable(),
})

export type StorySubmissionInput = z.infer<typeof storySubmissionSchema>
export type PressKitInput = z.infer<typeof pressKitSchema>
export type PartnerInquiryInput = z.infer<typeof partnerInquirySchema>

/**
 * Phase 9A: The Living Testament validation schemas
 */

export const livingTestamentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  scripture: z.string().min(2, 'Scripture reference is required'),
  scripture_text: z.string().optional().nullable(),
  testimony: z.string().min(10, 'Testimony must be at least 10 characters'),
  region: z.string().optional().nullable(),
  author_name: z.string().optional().nullable(),
  author_role: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
  display_order: z.number().int().default(0),
})

export const commissionedLeaderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(['founder', 'elder', 'pastor', 'director', 'coordinator', 'mentor', 'chef', 'farmer']),
  region: z.string().min(2, 'Region is required'),
  commissioned_at: z.string().optional().nullable(),
  covenant_signed: z.boolean().default(false),
  covenant_signed_at: z.string().optional().nullable(),
  commissioning_scripture: z.string().optional().nullable(),
  commissioning_notes: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photo_url: z.string().url('Invalid URL').optional().nullable(),
  is_public: z.boolean().default(true),
  display_order: z.number().int().default(0),
})

export type LivingTestamentInput = z.infer<typeof livingTestamentSchema>
export type CommissionedLeaderInput = z.infer<typeof commissionedLeaderSchema>
