export type ChefStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive'
export type AssignmentStatus = 'assigned' | 'confirmed' | 'completed' | 'cancelled'
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'
export type StripeConnectStatus = 'not_connected' | 'pending' | 'connected' | 'restricted'
export type BookingPayoutStatus = 'not_applicable' | 'pending' | 'paid' | 'blocked'
export type ChefPayoutStatus = 'pending' | 'paid' | 'failed'

export interface Chef {
    id: string
    created_at: string
    updated_at: string
    email: string
    name: string
    phone?: string
    bio?: string
    experience_years?: number
    specialties?: string[]
    certifications?: string[]
    status: ChefStatus
    application_submitted_at: string
    approved_at?: string
    approved_by?: string
    rejection_reason?: string
    stripe_account_id?: string // Legacy, kept for backward compatibility
    stripe_account_status?: string // Legacy
    stripe_onboarding_complete: boolean // Legacy
    stripe_onboarding_link?: string // Legacy
    stripe_onboarding_link_expires_at?: string // Legacy
    // Phase 5B: Stripe Connect fields
    stripe_connect_account_id?: string
    stripe_connect_status: StripeConnectStatus
    stripe_onboarded_at?: string
    payouts_enabled: boolean
    chef_portal_token: string
    payout_percentage: number
    tax_id?: string
    profile_image_url?: string
    website_url?: string
    instagram_handle?: string
    admin_notes?: string
}

export interface ChefAvailability {
    id: string
    chef_id: string
    date: string // ISO date string
    available: boolean
    start_time?: string
    end_time?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface BookingAssignment {
    id: string
    booking_id: string
    chef_id: string
    created_at: string
    assigned_by?: string
    booking_total_cents: number
    chef_payout_percentage: number
    chef_payout_cents: number
    platform_fee_cents: number
    payout_status: PayoutStatus
    payout_paid_at?: string
    stripe_payout_id?: string
    payout_failure_reason?: string
    status: AssignmentStatus
    chef_confirmed_at?: string
    completed_at?: string
    cancelled_at?: string
    cancellation_reason?: string
    assignment_notes?: string
    chef_notes?: string
}

export interface ChefApplication {
    email: string
    name: string
    phone?: string
    bio?: string
    experience_years?: number
    specialties?: string[]
    certifications?: string[]
    website_url?: string
    instagram_handle?: string
}

export interface ChefPayout {
    id: string
    booking_id: string
    chef_id: string
    amount_cents: number
    currency: string
    status: ChefPayoutStatus
    stripe_transfer_id?: string
    error_message?: string
    created_at: string
    paid_at?: string
}
