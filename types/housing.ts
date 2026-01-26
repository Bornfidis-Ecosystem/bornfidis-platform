/**
 * Phase 8B: Generational Wealth & Housing Covenant Types
 */

export type LandOwnershipType = 'community' | 'trust' | 'cooperative' | 'individual'
export type ProjectStatus = 'planning' | 'development' | 'construction' | 'active' | 'completed'
export type ResidentStatus = 'applied' | 'approved' | 'active' | 'owner' | 'moved_out'
export type LegacyFundPurpose = 'housing' | 'education' | 'land' | 'business' | 'emergency'
export type LegacyFundType = 'savings' | 'trust' | 'inheritance' | 'scholarship'

export interface HousingProject {
  id: string
  name: string
  region: string
  location_address?: string | null
  units_total: number
  units_occupied: number
  units_available: number
  land_owner?: string | null
  land_ownership_type: LandOwnershipType
  trust_established: boolean
  trust_name?: string | null
  trust_established_date?: string | null
  project_status: ProjectStatus
  description?: string | null
  vision?: string | null
  created_at: string
  updated_at: string
  // Joined data
  residents?: HousingResident[]
}

export interface HousingResident {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  family_size: number
  project_id: string
  equity_cents: number
  rent_cents: number
  monthly_payment_cents: number
  own_by_date?: string | null
  move_in_date?: string | null
  status: ResidentStatus
  application_date?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Joined data
  project?: HousingProject | null
}

export interface LegacyFund {
  id: string
  family_name: string
  region?: string | null
  balance_cents: number
  purpose: LegacyFundPurpose
  fund_type: LegacyFundType
  target_balance_cents?: number | null
  description?: string | null
  beneficiary_name?: string | null
  beneficiary_relationship?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HousingSummary {
  total_projects: number
  active_projects: number
  total_units: number
  occupied_units: number
  available_units: number
  total_residents: number
  active_residents: number
  owners: number
  total_legacy_funds: number
  total_legacy_balance_cents: number
}
