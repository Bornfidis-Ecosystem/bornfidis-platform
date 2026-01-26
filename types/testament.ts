/**
 * Phase 9A: The Living Testament Types
 */

export type LeaderRole = 'founder' | 'elder' | 'pastor' | 'director' | 'coordinator' | 'mentor' | 'chef' | 'farmer'

export interface LivingTestament {
  id: string
  title: string
  scripture: string
  scripture_text?: string | null
  testimony: string
  region?: string | null
  author_name?: string | null
  author_role?: string | null
  is_featured: boolean
  is_public: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CommissionedLeader {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role: LeaderRole
  region: string
  commissioned_at: string
  covenant_signed: boolean
  covenant_signed_at?: string | null
  commissioning_scripture?: string | null
  commissioning_notes?: string | null
  bio?: string | null
  photo_url?: string | null
  is_public: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface TestamentSummary {
  total_testimonies: number
  public_testimonies: number
  featured_testimonies: number
  total_commissioned: number
  covenant_signed_count: number
  public_leaders: number
}
