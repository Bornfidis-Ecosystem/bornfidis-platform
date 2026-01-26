/**
 * Phase 8A: Legacy & Succession Engine Types
 */

export type LeaderRole = 'founder' | 'elder' | 'pastor' | 'director' | 'coordinator' | 'mentor'
export type LeaderStatus = 'active' | 'emeritus' | 'training' | 'ordained'
export type DocumentCategory = 'vision' | 'doctrine' | 'operations' | 'governance' | 'finance' | 'discipleship'

export interface LegacyLeader {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role: LeaderRole
  region?: string | null
  bio?: string | null
  trained_at?: string | null
  ordained_at?: string | null
  succession_ready: boolean
  succession_notes?: string | null
  mentor_id?: string | null
  status: LeaderStatus
  created_at: string
  updated_at: string
  // Joined data
  mentor?: LegacyLeader | null
}

export interface LegacyDocument {
  id: string
  title: string
  category: DocumentCategory
  content: string
  summary?: string | null
  version: string
  is_active: boolean
  is_public: boolean
  author_id?: string | null
  approved_by?: string | null
  approved_at?: string | null
  tags?: string[] | null
  created_at: string
  updated_at: string
  // Joined data
  author?: LegacyLeader | null
  approver?: LegacyLeader | null
}

export interface PrayerRequest {
  id: string
  submitted_by: string
  email?: string | null
  region?: string | null
  request: string
  answered: boolean
  answer?: string | null
  answered_at?: string | null
  answered_by?: string | null
  is_public: boolean
  prayer_count: number
  created_at: string
  updated_at: string
  // Joined data
  answerer?: LegacyLeader | null
}

export interface LegacySummary {
  total_leaders: number
  succession_ready_count: number
  active_leaders: number
  total_documents: number
  public_documents: number
  total_prayer_requests: number
  answered_prayers: number
  unanswered_prayers: number
}
