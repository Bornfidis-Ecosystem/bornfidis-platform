export type FarmerStatus = 'pending' | 'approved' | 'inactive'
export type StripeConnectStatus = 'not_connected' | 'pending' | 'connected' | 'restricted'
export type FarmerPayoutStatus = 'pending' | 'on_hold' | 'paid' | 'failed'
export type FarmerRole = 'produce' | 'fish' | 'meat' | 'dairy' | 'spice' | 'beverage'

export interface Farmer {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone?: string
  location?: string
  parish?: string
  country?: string
  regenerative_practices?: string
  certifications?: string[]
  crops?: string[]
  proteins?: string[]
  processing_capabilities?: string[]
  status: FarmerStatus
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  stripe_account_id?: string
  stripe_connect_status: StripeConnectStatus
  stripe_onboarded_at?: string
  payouts_enabled: boolean
  farmer_portal_token?: string
  payout_percentage: number
  profile_image_url?: string
  website_url?: string
  instagram_handle?: string
  admin_notes?: string
}

export interface BookingFarmer {
  id: string
  booking_id: string
  farmer_id: string
  created_at: string
  updated_at: string
  role: FarmerRole
  payout_percent: number
  payout_amount_cents: number
  payout_status: FarmerPayoutStatus
  payout_error?: string
  transfer_id?: string
  paid_at?: string
  notes?: string
}

export interface FarmerApplication {
  name: string
  email: string
  phone?: string
  location: string
  parish?: string
  country?: string
  regenerative_practices?: string
  certifications?: string[]
  crops?: string[]
  proteins?: string[]
  processing_capabilities?: string[]
  website_url?: string
  instagram_handle?: string
}
