/**
 * Phase 7C: Global Harvest & Kingdom Capital Engine Types
 */

export interface HarvestMetric {
  id: string
  region_id?: string | null
  period_start: string // DATE
  period_end: string // DATE
  food_tons: number
  farmers_supported: number
  chefs_deployed: number
  meals_served: number
  land_regenerated_acres: number
  disciples_trained: number
  community_events: number
  scholarships_funded: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export type KingdomFundType = 'general' | 'scholarship' | 'land' | 'training' | 'emergency'

export interface KingdomFund {
  id: string
  region_id?: string | null
  fund_name: string
  purpose: string
  description?: string | null
  balance_cents: number
  target_balance_cents?: number | null
  fund_type: KingdomFundType
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ImpactTransactionSource = 'booking' | 'donation' | 'investment' | 'grant' | 'transfer'
export type ImpactTransactionType = 'credit' | 'debit'

export interface ImpactTransaction {
  id: string
  fund_id: string
  source: ImpactTransactionSource
  source_reference_id?: string | null
  amount_cents: number
  transaction_type: ImpactTransactionType
  purpose?: string | null
  description?: string | null
  created_by?: string | null
  created_at: string
}

export interface HarvestSummary {
  total_food_tons: number
  total_farmers_supported: number
  total_chefs_deployed: number
  total_meals_served: number
  total_land_regenerated_acres: number
  total_disciples_trained: number
  total_community_events: number
  total_scholarships_funded: number
  period_start?: string
  period_end?: string
}

export interface KingdomFundSummary {
  fund: KingdomFund
  total_credits_cents: number
  total_debits_cents: number
  transaction_count: number
  recent_transactions: ImpactTransaction[]
}
