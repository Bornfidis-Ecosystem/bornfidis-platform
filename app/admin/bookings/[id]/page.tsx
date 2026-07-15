import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getBookingActivities, getBookingWithQuote, getClientProfileSummaryForBooking } from '../actions'
import {
  requireHospitalityOpsPageAccess,
  resolveAdminPlatformRole,
  isFounderAdminRole,
} from '@/lib/admin-rbac'
import { canViewPlatformFinancials } from '@/lib/ops-coordinator-access'
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
import { CulinaryCard } from '@/components/culinary-os'

/**
 * Admin Booking Detail Page
 * Shows full booking details with editable status and admin notes
 * TODO: Phase 2B - Add authentication middleware here
 */
export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  await requireHospitalityOpsPageAccess()
  const platformRole = await resolveAdminPlatformRole()
  const showFinancials = canViewPlatformFinancials(platformRole)
  const showFounderOnlyPaymentControls = isFounderAdminRole(platformRole)

  const result = await getBookingWithQuote(params.id)

  if (!result.success || !result.booking) {
    notFound()
  }

  const booking = result.booking
  const aiInsights = await getInsightsForBooking(booking.id)
  const lastStripeActivity = showFinancials
    ? await getLastStripeActivityForBooking(booking.id)
    : null

  const activitiesResult = await getBookingActivities(booking.id)
  const activities = activitiesResult.success ? activitiesResult.activities : []
  const clientProfileResult = await getClientProfileSummaryForBooking(booking.id)
  const clientProfile = clientProfileResult.success ? clientProfileResult.clientProfile : null

  const quoteEmailTestimonial = await getQuoteDepositTestimonialSnippet(booking.id)

  const quoteLineItems = booking.quote_line_items
  const hasSavedQuote =
    (booking.quote_total_cents ?? 0) > 0 &&
    Array.isArray(quoteLineItems) &&
    quoteLineItems.length > 0

  const statusNorm = (booking.status ?? '').toLowerCase()
  const showPostConfirmOps =
    booking.status === 'Confirmed' || statusNorm === 'confirmed' || statusNorm === 'in_prep'

  const suspenseFallback = (label: string) => (
    <div className="py-stack-md text-center font-culinary-sans text-body-md text-culinary-text-muted">{label}</div>
  )

  const sectionTitleClass =
    'font-culinary-display text-title-md tracking-tight text-culinary-navy mb-stack-sm'

  return (
    <div className="space-y-stack-lg">
      <AdminBookingHeader
        bookingId={booking.id}
        bookingName={booking.name}
        showQuoteActions={showFinancials}
        actions={<SignOutButton />}
      />

      <main className="container mx-auto max-w-4xl px-4 pb-stack-lg">
        <CulinaryCard>
          <div className="space-y-stack-lg">
            <SlaSection booking={booking} />
            <AiInsightsBlock insights={aiInsights} />

            {showFinancials ? (
              <AdminBookingQuoteCard
                booking={booking}
                lastStripeActivity={lastStripeActivity}
                hasSavedQuote={hasSavedQuote}
                showFounderOnlyPaymentControls={showFounderOnlyPaymentControls}
              />
            ) : null}

            <div className="grid gap-gutter lg:grid-cols-2">
              <AdminBookingSummaryCard booking={booking} />
              <AdminBookingClientCard booking={booking} clientProfile={clientProfile} />
            </div>

            <section className="border-t border-culinary-outline pt-stack-lg">
              <h2 className={sectionTitleClass}>Admin Management</h2>
              <Suspense fallback={suspenseFallback('Loading...')}>
                <BookingDetailClient
                  booking={booking}
                  activities={activities}
                  quoteEmailTestimonial={quoteEmailTestimonial}
                />
              </Suspense>
            </section>

            {showPostConfirmOps && (
              <section className="border-t border-culinary-outline pt-stack-lg">
                <Suspense fallback={suspenseFallback('Loading timeline...')}>
                  <TimelineSection bookingId={booking.id} />
                </Suspense>
              </section>
            )}

            {showPostConfirmOps && (
              <section className="border-t border-culinary-outline pt-stack-lg">
                <Suspense fallback={suspenseFallback('Loading prep checklist...')}>
                  <PrepSection bookingId={booking.id} eventDate={booking.event_date} />
                </Suspense>
              </section>
            )}

            {showPostConfirmOps && (
              <section className="border-t border-culinary-outline pt-stack-lg">
                <Suspense fallback={suspenseFallback('Loading farmer assignments...')}>
                  <FarmerAssignmentSection bookingId={booking.id} eventDate={booking.event_date || ''} />
                </Suspense>
              </section>
            )}

            {showFinancials &&
              booking.chef_payout_amount_cents != null &&
              booking.chef_payout_amount_cents > 0 && (
                <section className="border-t border-culinary-outline pt-stack-lg">
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

            {showFinancials && showPostConfirmOps && (
              <section className="border-t border-culinary-outline pt-stack-lg">
                <ErrorBoundary>
                  <Suspense fallback={suspenseFallback('Loading payouts...')}>
                    <PayoutSection bookingId={booking.id} />
                  </Suspense>
                </ErrorBoundary>
              </section>
            )}
          </div>
        </CulinaryCard>
      </main>
    </div>
  )
}
