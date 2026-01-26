export type ImpactEventType = 'soil' | 'farmer' | 'chef' | 'guest' | 'community'
export type ImpactSnapshotPeriod = 'daily' | 'monthly' | 'annual'

export interface ImpactEvent {
  id: string
  created_at: string
  type: ImpactEventType
  reference_id?: string
  booking_id?: string
  metric: string
  value: number
  unit: string
  description?: string
  metadata?: Record<string, any>
}

export interface ImpactSnapshot {
  id: string
  created_at: string
  period: ImpactSnapshotPeriod
  period_start: string
  period_end: string
  soil_score: number
  farmer_income_cents: number
  chef_income_cents: number
  meals_served: number
  chefs_active: number
  farmers_active: number
  families_supported: number
  scholarships_funded: number
  bookings_completed: number
  ingredients_sourced: number
  regenerative_practices_count: number
  notes?: string
}

export interface ImpactMetrics {
  total_soil_score: number
  total_farmer_income_cents: number
  total_chef_income_cents: number
  total_meals_served: number
  active_chefs: number
  active_farmers: number
  families_supported: number
  scholarships_funded: number
  bookings_completed: number
  ingredients_sourced: number
  avg_soil_score: number
  recent_events: ImpactEvent[]
}

export interface ImpactChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}
