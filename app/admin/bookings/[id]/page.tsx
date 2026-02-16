import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getBookingWithQuote } from '../actions'
import { getInsightsForBooking } from '@/lib/ai-ops-insights'
import BookingDetailClient from './BookingDetailClient'
import AiInsightsBlock from './AiInsightsBlock'
import TimelineSection from './TimelineSection'
import PrepSection from './PrepSection'
import FarmerAssignmentSection from './FarmerAssignmentSection'
import PayoutSection from './PayoutSection'
import ChefPayoutBonusSection from './ChefPayoutBonusSection'
import ErrorBoundary from './ErrorBoundary'
import SignOutButton from '@/components/admin/SignOutButton'

/**
 * Admin Booking Detail Page
 * Shows full booking details with editable status and admin notes
 * TODO: Phase 2B - Add authentication middleware here
 */
export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const result = await getBookingWithQuote(params.id)

  if (!result.success || !result.booking) {
    notFound()
  }

  const booking = result.booking

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/bookings"
                className="text-gold hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Bookings
              </Link>
              <Link
                href={`/admin/incidents?bookingId=${booking.id}`}
                className="text-gold hover:underline text-sm ml-4 inline-block"
              >
                Log incident
              </Link>
              <h1 className="text-2xl font-bold">Booking Details</h1>
              <p className="text-gold text-sm mt-1">{booking.name}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Booking Overview - Read Only */}
          <SlaSection booking={booking} />
          <AiInsightsBlock insights={aiInsights} />

          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Booking Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Customer Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Customer Information
                </h3>

                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <p className="text-base text-gray-900 font-medium">{booking.name}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-base text-gray-900">
                    {booking.email ? (
                      <a href={`mailto:${booking.email}`} className="text-navy hover:underline">
                        {booking.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <p className="text-base text-gray-900">
                    {booking.phone ? (
                      <a href={`tel:${booking.phone}`} className="text-navy hover:underline">
                        {booking.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Created</label>
                  <p className="text-base text-gray-900">
                    {new Date(booking.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Right Column - Event Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Event Details
                </h3>

                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1">
                    📅 Event Date & Time
                  </label>
                  <p className="text-base text-gray-900 font-medium">
                    {booking.event_date
                      ? new Date(booking.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                    {booking.event_time && ` at ${booking.event_time}`}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1">
                    📍 Location
                  </label>
                  <p className="text-base text-gray-900">{booking.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      👥 Guests
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {booking.guests ?? '—'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      💰 Budget
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {booking.budget_range ? String(booking.budget_range).replace(/_/g, ' ') : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {(booking.dietary || booking.notes) ? (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Customer Requests
                </h3>

                {booking.dietary && (
                  <div className="mb-2">
                    <label className="text-xs text-gray-500">Dietary Restrictions</label>
                    <p className="text-sm text-gray-900 italic">{booking.dietary}</p>
                  </div>
                )}

                {booking.notes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <p className="text-sm text-gray-900 italic whitespace-pre-wrap">&quot;{booking.notes}&quot;</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Admin Section - Editable */}
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold text-navy mb-4">Admin Management</h2>
            <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading...</div>}>
              <BookingDetailClient booking={booking} />
            </Suspense>
          </section>

          {/* Phase 2A: Booking Timeline */}
          {booking.status === 'Confirmed' && (
            <section className="border-t pt-6">
              <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading timeline...</div>}>
                <TimelineSection bookingId={booking.id} />
              </Suspense>
            </section>
          )}

          {/* Phase 3.5: Event Prep Checklist */}
          {booking.status === 'Confirmed' && (
            <section className="border-t pt-6">
              <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading prep checklist...</div>}>
                <PrepSection bookingId={booking.id} eventDate={booking.event_date} />
              </Suspense>
            </section>
          )}

          {/* Phase 4: Assigned Farmers */}
          {booking.status === 'Confirmed' && (
            <section className="border-t pt-6">
                <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading farmer assignments...</div>}>
                  <FarmerAssignmentSection bookingId={booking.id} eventDate={booking.event_date || ''} />
                </Suspense>
            </section>
          )}

          {/* Phase 2Q: Chef payout breakdown + override */}
          {booking.chef_payout_amount_cents != null && booking.chef_payout_amount_cents > 0 && (
            <section className="border-t pt-6">
              <ChefPayoutBonusSection
                bookingId={booking.id}
                chefPayoutAmountCents={booking.chef_payout_amount_cents}
                chefPayoutBaseCents={booking.chef_payout_base_cents}
                chefPayoutBonusCents={booking.chef_payout_bonus_cents}
                chefPayoutBonusBreakdown={booking.chef_payout_bonus_breakdown}
                chefPayoutBonusOverride={booking.chef_payout_bonus_override}
                chefPayoutStatus={booking.chef_payout_status}
                chefTierSnapshot={booking.chef_tier_snapshot}
                chefRateMultiplier={booking.chef_rate_multiplier}
              />
            </section>
          )}

          {/* Phase 4.5: Farmer Payouts */}
          {booking.status === 'Confirmed' && (
            <section className="border-t pt-6">
              <ErrorBoundary>
                <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading payouts...</div>}>
                  <PayoutSection bookingId={booking.id} />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}

        </div>
      </main>
    </div>
  )
}

