import { notFound } from 'next/navigation'
import ChefPortalClient from './ChefPortalClient'
import { supabaseAdmin } from '@/lib/supabase'

interface ChefPortalData {
  chef: {
    id: string
    name: string
    email: string
    stripe_connect_status: string
    payouts_enabled: boolean
    stripe_onboarded_at?: string
    payout_percentage: number
  }
  earnings: {
    total_paid_cents: number
    pending_count: number
    blocked_count: number
  }
  bookings: Array<{
    id: string
    name: string
    event_date: string
    location: string
    guests?: number
    quote_total_cents: number
    chef_payout_amount_cents?: number
    chef_payout_status: string
    fully_paid_at?: string
  }>
}

async function getChefPortalData(token: string): Promise<ChefPortalData | null> {
  try {
    // Fetch chef by token
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select(`
        id,
        name,
        email,
        stripe_connect_status,
        payouts_enabled,
        stripe_onboarded_at,
        payout_percentage
      `)
      .eq('chef_portal_token', token)
      .single()

    if (chefError || !chef) {
      return null
    }

    // Fetch earnings (paid payouts)
    const { data: payouts } = await supabaseAdmin
      .from('chef_payouts')
      .select('amount_cents, status')
      .eq('chef_id', chef.id)

    const totalPaidCents = payouts
      ?.filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0

    // Phase 5D: Fetch assigned bookings with completion status
    const { data: bookings } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        event_date,
        location,
        guests,
        quote_total_cents,
        chef_payout_amount_cents,
        chef_payout_status,
        fully_paid_at,
        job_completed_at,
        job_completed_by
      `)
      .eq('assigned_chef_id', chef.id)
      .order('event_date', { ascending: false })
      .limit(50)

    const pendingCount = bookings?.filter(b => b.chef_payout_status === 'pending' && b.fully_paid_at).length || 0
    const blockedCount = bookings?.filter(b => b.chef_payout_status === 'blocked').length || 0

    return {
      chef: chef as any,
      earnings: {
        total_paid_cents: totalPaidCents,
        pending_count: pendingCount,
        blocked_count: blockedCount,
      },
      bookings: (bookings || []) as any[],
    }
  } catch (error) {
    console.error('Error fetching chef portal data:', error)
    return null
  }
}

export default async function ChefPortalPage({ params }: { params: { token: string } }) {
  const portalData = await getChefPortalData(params.token)

  if (!portalData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">
            This portal link is invalid or has expired. Please contact us for assistance.
          </p>
          <a
            href="mailto:brian@bornfidis.com"
            className="inline-block px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    )
  }

  return <ChefPortalClient portalData={portalData} token={params.token} />
}
