import Link from 'next/link'
import type { ReactNode } from 'react'
import { CulinaryPageHeader } from '@/components/culinary-os'

type AdminBookingHeaderProps = {
  bookingId: string
  bookingName: string
  quotesHref: string
  showQuoteActions?: boolean
  actions?: ReactNode
}

export function AdminBookingHeader({
  bookingId,
  bookingName,
  quotesHref,
  showQuoteActions = true,
  actions,
}: AdminBookingHeaderProps) {
  return (
    <div className="container mx-auto space-y-stack-md px-4 pt-stack-md">
      <nav className="flex flex-wrap gap-x-4 gap-y-1 font-culinary-sans text-label-caps text-culinary-navy">
        <Link
          href="/admin/bookings"
          className="underline decoration-culinary-gold-line underline-offset-4 hover:text-culinary-text-muted"
        >
          ← Back to Bookings
        </Link>
        <Link
          href={`/admin/incidents?bookingId=${bookingId}`}
          className="underline decoration-culinary-gold-line underline-offset-4 hover:text-culinary-text-muted"
        >
          Log incident
        </Link>
      </nav>

      <CulinaryPageHeader
        className="border-0 pb-0"
        title={bookingName}
        description={
          showQuoteActions
            ? 'Booking details — quotes, payments, timeline, and prep.'
            : 'Booking details — timeline, prep, logistics, and client notes.'
        }
        actions={
          <>
            {showQuoteActions ? (
              <Link
                href={quotesHref}
                className="inline-flex items-center justify-center rounded-none border border-culinary-gold-line bg-culinary-gold px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:opacity-90"
              >
                Create quote from booking
              </Link>
            ) : null}
            {actions}
          </>
        }
      />
    </div>
  )
}
