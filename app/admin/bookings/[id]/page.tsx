import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getBookingActivities, getBookingWithQuote, getClientProfileSummaryForBooking } from '../actions'
import { getLastStripeActivityForBooking } from '@/lib/admin-payment-health'
import BookingPaymentSummaryCard from '@/components/admin/BookingPaymentSummaryCard'
import { getInsightsForBooking } from '@/lib/ai-ops-insights'
import { getQuoteDepositTestimonialSnippet } from '@/lib/homepage-testimonials'
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
  const aiInsights = await getInsightsForBooking(booking.id)
  const lastStripeActivity = await getLastStripeActivityForBooking(booking.id)

  const activitiesResult = await getBookingActivities(booking.id)
  const activities = activitiesResult.success ? activitiesResult.activities : []
  const clientProfileResult = await getClientProfileSummaryForBooking(booking.id)
  const clientProfile = clientProfileResult.success ? clientProfileResult.clientProfile : null

  const eventDateForQuotes = (() => {
    const raw = booking.event_date || ''
    const dateOnlyMatch = raw.match(/^\d{4}-\d{2}-\d{2}/)
    if (dateOnlyMatch) return dateOnlyMatch[0]

    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  })()

  const quotesSearch = new URLSearchParams({
    clientName: booking.name,
    guestCount: booking.guests != null ? String(booking.guests) : '',
    eventDate: eventDateForQuotes || booking.event_date,
  })

  if (!booking.guests || booking.guests <= 0) quotesSearch.delete('guestCount')

  const quotesHref = `/admin/quotes/builder?${quotesSearch.toString()}`

  const quoteEmailTestimonial = await getQuoteDepositTestimonialSnippet(booking.id)

  const quoteLineItems = booking.quote_line_items
  const hasSavedQuote =
    (booking.quote_total_cents ?? 0) > 0 &&
    Array.isArray(quoteLineItems) &&
    quoteLineItems.length > 0

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

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={quotesHref}
                  className="inline-flex items-center justify-center rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:opacity-90 transition"
                >
                  Create quote from booking
                </Link>
              </div>
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

          <BookingPaymentSummaryCard
            booking={booking}
            lastStripeActivity={lastStripeActivity}
            hasSavedQuote={hasSavedQuote}
          />

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

          <div className="bg-white border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Client Profile</h3>
            {clientProfile ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">{clientProfile.name}</p>
                  <p className="text-sm text-gray-600">{clientProfile.phone || '—'} · {clientProfile.email || '—'}</p>
                </div>
                <Link
                  href={`/admin/clients/${clientProfile.id}`}
                  className="inline-flex items-center rounded-lg border border-navy/20 px-4 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition"
                >
                  View client profile
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked client profile.</p>
            )}
          </div>

          {/* Admin Section - Editable */}
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold text-navy mb-4">Admin Management</h2>
            <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading...</div>}>
              <BookingDetailClient
                booking={booking}
                activities={activities}
                quoteEmailTestimonial={quoteEmailTestimonial}
              />
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

