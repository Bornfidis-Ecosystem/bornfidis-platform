import { notFound } from 'next/navigation'
import ChefDashboardClient from './ChefDashboardClient'
import { supabaseAdmin } from '@/lib/supabase'

interface ChefDashboardData {
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
    pending_cents: number
    upcoming_cents: number
  }
  bookings: {
    upcoming: Array<{
      id: string
      name: string
      event_date: string
      location: string
      guests?: number
      quote_total_cents: number
      payout_amount_cents: number
      status: string
    }>
    completed: Array<{
      id: string
      name: string
      event_date: string
      location: string
      quote_total_cents: number
      payout_amount_cents: number
      paid_at?: string
      status: string
    }>
  }
}

async function getChefDashboardData(token: string): Promise<ChefDashboardData | null> {
  try {
    // Fetch chef by portal token
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

    // Fetch all bookings assigned to this chef
    const { data: bookingChefs } = await supabaseAdmin
      .from('booking_chefs')
      .select(`
        id,
        payout_amount_cents,
        status,
        paid_at,
        booking:booking_inquiries(
          id,
          name,
          event_date,
          location,
          guests,
          quote_total_cents,
          fully_paid_at
        )
      `)
      .eq('chef_id', chef.id)
      .order('created_at', { ascending: false })

    const now = new Date()
    const upcoming: any[] = []
    const completed: any[] = []
    let totalPaidCents = 0
    let pendingCents = 0
    let upcomingCents = 0

    bookingChefs?.forEach((bc: any) => {
      const booking = bc.booking
      if (!booking) return

      const eventDate = new Date(booking.event_date)
      const bookingData = {
        id: booking.id,
        name: booking.name,
        event_date: booking.event_date,
        location: booking.location,
        guests: booking.guests,
        quote_total_cents: booking.quote_total_cents || 0,
        payout_amount_cents: bc.payout_amount_cents || 0,
        status: bc.status,
        paid_at: bc.paid_at,
      }

      if (bc.status === 'paid' || booking.fully_paid_at) {
        completed.push(bookingData)
        if (bc.status === 'paid') {
          totalPaidCents += bc.payout_amount_cents || 0
        }
      } else if (eventDate >= now) {
        upcoming.push(bookingData)
        upcomingCents += bc.payout_amount_cents || 0
      } else {
        completed.push(bookingData)
        if (bc.status === 'assigned' || bc.status === 'completed') {
          pendingCents += bc.payout_amount_cents || 0
        }
      }
    })

    return {
      chef: chef as any,
      earnings: {
        total_paid_cents: totalPaidCents,
        pending_cents: pendingCents,
        upcoming_cents: upcomingCents,
      },
      bookings: {
        upcoming: upcoming.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
        completed: completed.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()),
      },
    }
  } catch (error) {
    console.error('Error fetching chef dashboard data:', error)
    return null
  }
}

export default async function ChefDashboardPage({ params }: { params: { token: string } }) {
  const dashboardData = await getChefDashboardData(params.token)

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">
            This dashboard link is invalid or has expired. Please contact us for assistance.
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

  return <ChefDashboardClient dashboardData={dashboardData} chefId={dashboardData.chef.id} />
}
