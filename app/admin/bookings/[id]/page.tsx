import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getBookingActivities, getBookingWithQuote, getClientProfileSummaryForBooking } from '../actions'
import {
  requireManagerOrFounderPageAccess,
  resolveAdminPlatformRole,
  isFounderAdminRole,
} from '@/lib/admin-rbac'
import { getLastStripeActivityForBooking } from '@/lib/admin-payment-health'
import { AdminBookingHeader } from '@/components/admin/booking-detail/AdminBookingHeader'
import { AdminBookingSummaryCard } from '@/components/admin/booking-detail/AdminBookingSummaryCard'
import { AdminBookingClientCard } from '@/components/admin/booking-detail/AdminBookingClientCard'
import { AdminBookingQuoteCard } from '@/components/admin/booking-detail/AdminBookingQuoteCard'
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
import SlaSection from './SlaSection'

/**
 * Admin Booking Detail Page
 * Shows full booking details with editable status and admin notes
 * TODO: Phase 2B - Add authentication middleware here
 */
export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  await requireManagerOrFounderPageAccess()
  const showFounderOnlyPaymentControls = isFounderAdminRole(await resolveAdminPlatformRole())

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

  const statusNorm = (booking.status ?? '').toLowerCase()
  const showPostConfirmOps =
    booking.status === 'Confirmed' || statusNorm === 'confirmed' || statusNorm === 'in_prep'

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminBookingHeader
        bookingId={booking.id}
        bookingName={booking.name}
        quotesHref={quotesHref}
        actions={<SignOutButton />}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
          <SlaSection booking={booking} />
          <AiInsightsBlock insights={aiInsights} />

          <AdminBookingQuoteCard
            booking={booking}
            lastStripeActivity={lastStripeActivity}
            hasSavedQuote={hasSavedQuote}
            showFounderOnlyPaymentControls={showFounderOnlyPaymentControls}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminBookingSummaryCard booking={booking} />
            <AdminBookingClientCard booking={booking} clientProfile={clientProfile} />
          </div>

          {/* Admin Section - Editable */}
          <section className="border-t border-stone-200 pt-6">
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
          {showPostConfirmOps && (
            <section className="border-t pt-6">
              <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading timeline...</div>}>
                <TimelineSection bookingId={booking.id} />
              </Suspense>
            </section>
          )}

          {/* Phase 3.5: Event Prep Checklist */}
          {showPostConfirmOps && (
            <section className="border-t pt-6">
              <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading prep checklist...</div>}>
                <PrepSection bookingId={booking.id} eventDate={booking.event_date} />
              </Suspense>
            </section>
          )}

          {/* Phase 4: Assigned Farmers */}
          {showPostConfirmOps && (
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
          {showPostConfirmOps && (
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

