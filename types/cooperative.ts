export type CooperativeMemberRole = 'farmer' | 'chef' | 'educator' | 'builder' | 'partner'
export type CooperativeMemberStatus = 'pending' | 'active' | 'inactive' | 'suspended'
export type CooperativePayoutStatus = 'pending' | 'paid' | 'failed'
export type CooperativePayoutPeriodType = 'monthly' | 'quarterly' | 'annual'
export type CooperativeTrainingTrack = 'food' | 'soil' | 'faith' | 'enterprise'

export interface CooperativeMember {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone?: string
  role: CooperativeMemberRole
  region: string
  joined_at: string
  status: CooperativeMemberStatus
  approved_at?: string
  approved_by?: string
  impact_score: number
  payout_share_percent: number
  farmer_id?: string
  chef_id?: string
  bio?: string
  profile_image_url?: string
  website_url?: string
  instagram_handle?: string
  admin_notes?: string
  metadata?: Record<string, any>
}

export interface CooperativePayout {
  id: string
  created_at: string
  member_id: string
  period: string
  period_type: CooperativePayoutPeriodType
  amount_cents: number
  impact_score: number
  payout_share_percent: number
  total_cooperative_profit_cents: number
  payout_status: CooperativePayoutStatus
  stripe_transfer_id?: string
  paid_at?: string
  notes?: string
  // Joined data
  member?: CooperativeMember
}

export interface CooperativeTraining {
  id: string
  created_at: string
  updated_at: string
  title: string
  track: CooperativeTrainingTrack
  content: string
  description?: string
  required: boolean
  required_for_roles?: CooperativeMemberRole[]
  sort_order: number
  is_active: boolean
  estimated_duration_minutes?: number
  video_url?: string
  resources?: Record<string, any>
}

export interface CooperativeMemberTraining {
  id: string
  created_at: string
  member_id: string
  training_id: string
  completed_at?: string
  score?: number
  notes?: string
  // Joined data
  training?: CooperativeTraining
  member?: CooperativeMember
}

export interface CooperativeMetrics {
  total_members: number
  active_members: number
  total_payouts_cents: number
  monthly_payouts_cents: number
  total_impact_score: number
  avg_impact_score: number
  members_by_role: Record<CooperativeMemberRole, number>
  members_by_region: Record<string, number>
}
