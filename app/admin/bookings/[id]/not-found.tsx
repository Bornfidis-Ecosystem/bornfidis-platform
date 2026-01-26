import Link from 'next/link'

/**
 * Not Found page for booking detail
 * Shows when a booking ID doesn't exist
 */
export default function BookingNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy mb-2">Booking Not Found</h1>
            <p className="text-gray-600">
              The booking you're looking for doesn't exist or may have been deleted.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="inline-block px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    </div>
  )
}
