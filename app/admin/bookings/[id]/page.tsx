import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getBookingWithQuote } from '../actions'
import BookingDetailClient from './BookingDetailClient'
import QuoteSection from './QuoteSection'
import TimelineSection from './TimelineSection'
import PrepSection from './PrepSection'
import FarmerAssignmentSection from './FarmerAssignmentSection'
import PayoutSection from './PayoutSection'
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
          {/* Customer Information */}
          <section>
            <h2 className="text-xl font-semibold text-navy mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-900">{booking.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">
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
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">
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
                <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                <p className="text-gray-900">
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
          </section>

          {/* Event Details */}
          <section>
            <h2 className="text-xl font-semibold text-navy mb-4">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Event Date</label>
                <p className="text-gray-900">
                  {booking.event_date ? (
                    new Date(booking.event_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Event Time</label>
                <p className="text-gray-900">{booking.event_time || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                <p className="text-gray-900">{booking.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Number of Guests</label>
                <p className="text-gray-900">{booking.guests || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Budget Range</label>
                <p className="text-gray-900">{booking.budget_range || '—'}</p>
              </div>
            </div>
          </section>

          {/* Preferences */}
          {(booking.dietary || booking.notes) && (
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">Preferences & Notes</h2>
              <div className="space-y-4">
                {booking.dietary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Dietary Restrictions</label>
                    <p className="text-gray-900">{booking.dietary}</p>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Customer Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
                  </div>
                )}
              </div>
            </section>
          )}

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

          {/* Quote & Deposit Section - Phase 3A (Legacy) */}
          <section className="border-t pt-6">
            <QuoteSection booking={booking} />
          </section>
        </div>
      </main>
    </div>
  )
}
