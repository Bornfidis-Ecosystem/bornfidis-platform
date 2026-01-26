/**
 * Phase 10B: Launch & Storytelling Engine Types
 */

export type StoryCategory = 'testimony' | 'impact' | 'farmer' | 'chef' | 'community' | 'partner'
export type PartnerOrganizationType = 'media' | 'nonprofit' | 'business' | 'church' | 'government' | 'other'
export type PartnershipInterest = 'sponsorship' | 'collaboration' | 'media' | 'distribution' | 'other'
export type PartnerInquiryStatus = 'submitted' | 'reviewed' | 'contacted' | 'partnered' | 'declined'
export type PressKitFileType = 'pdf' | 'zip' | 'doc'

export interface Story {
  id: string
  title: string
  author_name: string
  author_email?: string | null
  author_role?: string | null
  author_region?: string | null
  story_text: string
  video_url?: string | null
  image_url?: string | null
  category: StoryCategory
  is_featured: boolean
  is_approved: boolean
  is_public: boolean
  submitted_at: string
  approved_at?: string | null
  approved_by?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface PressKit {
  id: string
  title: string
  description?: string | null
  file_url: string
  file_type: PressKitFileType
  file_size_bytes?: number | null
  version: string
  is_active: boolean
  download_count: number
  created_at: string
  updated_at: string
}

export interface PartnerInquiry {
  id: string
  organization_name: string
  contact_name: string
  contact_email: string
  contact_phone?: string | null
  organization_type?: PartnerOrganizationType | null
  partnership_interest?: PartnershipInterest | null
  message: string
  website_url?: string | null
  status: PartnerInquiryStatus
  reviewed_at?: string | null
  reviewed_by?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface LaunchSummary {
  total_stories: number
  approved_stories: number
  featured_stories: number
  pending_stories: number
  total_partner_inquiries: number
  active_press_kits: number
}
