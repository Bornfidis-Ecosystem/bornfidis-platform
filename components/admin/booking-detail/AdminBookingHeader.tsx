import Link from 'next/link'
import type { ReactNode } from 'react'

type AdminBookingHeaderProps = {
  bookingId: string
  bookingName: string
  quotesHref: string
  actions?: ReactNode
}

export function AdminBookingHeader({ bookingId, bookingName, quotesHref, actions }: AdminBookingHeaderProps) {
  return (
    <header className="bg-navy text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link href="/admin/bookings" className="text-gold hover:underline">
                ← Back to Bookings
              </Link>
              <Link href={`/admin/incidents?bookingId=${bookingId}`} className="text-gold hover:underline">
                Log incident
              </Link>
            </div>
            <h1 className="mt-3 text-2xl font-bold">Booking Details</h1>
            <p className="text-gold text-sm mt-1">{bookingName}</p>
            <div className="mt-4">
              <Link
                href={quotesHref}
                className="inline-flex items-center justify-center rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:opacity-90 transition"
              >
                Create quote from booking
              </Link>
            </div>
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
        </div>
      </div>
    </header>
  )
}
