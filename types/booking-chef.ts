export type BookingChefStatus = 'assigned' | 'completed' | 'paid'
export type PayoutStatus = 'pending' | 'on_hold' | 'paid' | 'failed'

export interface BookingChef {
  id: string
  booking_id: string
  chef_id: string
  created_at: string
  updated_at: string
  payout_percentage: number
  payout_amount_cents: number
  status: BookingChefStatus
  completed_at?: string
  paid_at?: string
  stripe_transfer_id?: string
  notes?: string
  // Phase 5D: Enhanced payout tracking
  payout_status: PayoutStatus
  payout_error?: string
  transfer_id?: string
}
