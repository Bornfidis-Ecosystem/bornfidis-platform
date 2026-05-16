import Link from 'next/link'
import { CulinaryCard } from '@/components/culinary-os'

/**
 * Not Found page for booking detail
 * Shows when a booking ID doesn't exist
 */
export default function BookingNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <CulinaryCard>
          <div className="mb-stack-md">
            <div className="mx-auto mb-stack-sm flex h-16 w-16 items-center justify-center rounded-none border border-culinary-outline bg-culinary-surface-low">
              <svg className="h-8 w-8 text-culinary-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="font-culinary-display text-headline-lg-mobile text-culinary-navy">Booking not found</h1>
            <p className="mt-stack-sm font-culinary-sans text-body-md text-culinary-text-muted">
              The booking you&apos;re looking for doesn&apos;t exist or may have been deleted.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center justify-center rounded-none border border-culinary-navy bg-culinary-navy px-6 py-3 font-culinary-sans text-label-caps text-culinary-on-navy transition refined hover:opacity-90"
          >
            Back to Bookings
          </Link>
        </CulinaryCard>
      </div>
    </div>
  )
}
