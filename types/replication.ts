export type ReplicationRegionStatus = 'inquiry' | 'approved' | 'launching' | 'active'
export type ReplicationKitType = 'chef' | 'farm' | 'market' | 'housing' | 'education'
export type ImpactInvestorStatus = 'inquiry' | 'committed' | 'paid' | 'active'
export type RegionKitStatus = 'not_started' | 'in_progress' | 'completed'
export type InvestmentType = 'grant' | 'loan' | 'equity' | 'donation'

export interface ReplicationRegion {
  id: string
  created_at: string
  updated_at: string
  name: string
  country: string
  city?: string
  region_description?: string
  leader_name: string
  leader_email: string
  leader_phone?: string
  leader_bio?: string
  leader_experience?: string
  status: ReplicationRegionStatus
  inquiry_submitted_at: string
  approved_at?: string
  approved_by?: string
  launch_date?: string
  launched_at?: string
  impact_goal?: string
  target_communities?: string[]
  expected_farmers: number
  expected_chefs: number
  capital_needed_cents: number
  capital_raised_cents: number
  support_needed?: string[]
  website_url?: string
  social_media?: Record<string, any>
  admin_notes?: string
  rejection_reason?: string
  metadata?: Record<string, any>
}

export interface ReplicationKit {
  id: string
  created_at: string
  updated_at: string
  region_id?: string
  kit_type: ReplicationKitType
  version: string
  title: string
  description?: string
  content: string
  resources?: Record<string, any>
  required_for_launch: boolean
  prerequisites?: string[]
  sort_order: number
  is_active: boolean
  is_public: boolean
  estimated_completion_days?: number
  difficulty_level?: string
  tags?: string[]
}

export interface ImpactInvestor {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone?: string
  organization?: string
  region_interest?: string[]
  capital_committed_cents: number
  capital_paid_cents: number
  investment_type?: InvestmentType
  status: ImpactInvestorStatus
  committed_at?: string
  paid_at?: string
  terms_notes?: string
  expected_return?: string
  website_url?: string
  linkedin_url?: string
  admin_notes?: string
  metadata?: Record<string, any>
}

export interface ReplicationRegionKit {
  id: string
  created_at: string
  updated_at: string
  region_id: string
  kit_id: string
  status: RegionKitStatus
  started_at?: string
  completed_at?: string
  notes?: string
  // Joined data
  kit?: ReplicationKit
  region?: ReplicationRegion
}
