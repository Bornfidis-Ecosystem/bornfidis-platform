'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatUSD } from '@/lib/money'

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
    job_completed_at?: string
    job_completed_by?: string
  }>
}

interface ChefPortalClientProps {
  portalData: ChefPortalData
  token: string
}

export default function ChefPortalClient({ portalData, token }: ChefPortalClientProps) {
  const searchParams = useSearchParams()
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [markingComplete, setMarkingComplete] = useState<string | null>(null)

  useEffect(() => {
    const onboarding = searchParams.get('onboarding')
    if (onboarding === 'complete') {
      setMessage({ type: 'success', text: 'Stripe onboarding completed! Your account is being verified.' })
    } else if (onboarding === 'refresh') {
      setMessage({ type: 'error', text: 'Onboarding session expired. Please start a new onboarding session.' })
    }
  }, [searchParams])

  const handleStartOnboarding = async () => {
    setIsLoadingOnboarding(true)
    try {
      const response = await fetch(`/api/chef/${token}/account-link`)
      const data = await response.json()

      if (data.success && data.onboarding_url) {
        setOnboardingUrl(data.onboarding_url)
        window.location.href = data.onboarding_url
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create onboarding link' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsLoadingOnboarding(false)
    }
  }

  // Phase 5D: Mark job as complete
  const handleMarkComplete = async (bookingId: string) => {
    setMarkingComplete(bookingId)
    setMessage(null)

    try {
      const response = await fetch(`/api/chef/portal/${token}/mark-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Job marked as complete! Admin will review and confirm.' })
        // Refresh page to show updated status
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to mark job as complete' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setMarkingComplete(null)
    }
  }

  const getConnectStatusBadge = () => {
    switch (portalData.chef.stripe_connect_status) {
      case 'connected':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            ✓ Connected
          </span>
        )
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            ⏳ Pending
          </span>
        )
      case 'restricted':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            ⚠️ Restricted
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
            Not Connected
          </span>
        )
    }
  }

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="text-green-600 font-semibold">✓ Paid</span>
      case 'pending':
        return <span className="text-yellow-600 font-semibold">⏳ Pending</span>
      case 'blocked':
        return <span className="text-red-600 font-semibold">⚠️ Blocked</span>
      default:
        return <span className="text-gray-400">—</span>
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Bornfidis Chef Network</h1>
          <div className="h-1 w-24 bg-[#FFBC00] mb-4"></div>
          <p className="text-green-100 text-sm">Welcome, {portalData.chef.name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Stripe Connect Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Stripe Connect Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Account Status:</span>
              {getConnectStatusBadge()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payouts Enabled:</span>
              <span className={`font-medium ${portalData.chef.payouts_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {portalData.chef.payouts_enabled ? 'Yes ✓' : 'No'}
              </span>
            </div>
            {portalData.chef.stripe_onboarded_at && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Onboarded:</span>
                <span className="font-medium text-sm">
                  {new Date(portalData.chef.stripe_onboarded_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {portalData.chef.stripe_connect_status !== 'connected' && (
              <div className="pt-4 border-t">
                <button
                  onClick={handleStartOnboarding}
                  disabled={isLoadingOnboarding}
                  className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingOnboarding ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Continue Stripe Onboarding'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Complete Stripe onboarding to receive payouts ({portalData.chef.payout_percentage}% of booking total)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Earnings Snapshot */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Earnings Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Paid Out</p>
              <p className="text-2xl font-bold text-[#1a5f3f]">
                {formatUSD(portalData.earnings.total_paid_cents)}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-700">
                {portalData.earnings.pending_count}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Blocked</p>
              <p className="text-2xl font-bold text-red-700">
                {portalData.earnings.blocked_count}
              </p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Assigned Bookings
          </h2>
          {portalData.bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-semibold">Event</th>
                    <th className="text-left py-2 text-gray-600 font-semibold">Date</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Total</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Payout</th>
                    <th className="text-right py-2 text-gray-600 font-semibold">Status</th>
                    <th className="text-center py-2 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portalData.bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-xs text-gray-500">{booking.location}</div>
                        {booking.guests && (
                          <div className="text-xs text-gray-500">{booking.guests} guests</div>
                        )}
                        {booking.job_completed_at && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Completed {new Date(booking.job_completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-gray-700">
                        {new Date(booking.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatUSD(booking.quote_total_cents)}
                      </td>
                      <td className="py-3 text-right">
                        {booking.chef_payout_amount_cents ? (
                          <span className="font-medium text-green-600">
                            {formatUSD(booking.chef_payout_amount_cents)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {getPayoutStatusBadge(booking.chef_payout_status)}
                      </td>
                      <td className="py-3 text-center">
                        {!booking.job_completed_at && (
                          <button
                            onClick={() => handleMarkComplete(booking.id)}
                            disabled={markingComplete === booking.id}
                            className="px-3 py-1.5 bg-[#1a5f3f] text-white text-xs font-semibold rounded hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {markingComplete === booking.id ? 'Marking...' : 'Mark Complete'}
                          </button>
                        )}
                        {booking.job_completed_at && booking.job_completed_by === 'chef' && (
                          <span className="text-xs text-yellow-600 font-medium">Awaiting Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="italic">
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
          </p>
          <p className="mt-2 font-semibold">— Colossians 3:23</p>
        </div>
      </main>
    </div>
  )
}
