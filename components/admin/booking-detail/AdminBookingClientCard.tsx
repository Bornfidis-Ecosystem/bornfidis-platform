import Link from 'next/link'
import type { BookingInquiry } from '@/types/booking'

export type ClientProfileSummary = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
}

type ClientBooking = Pick<BookingInquiry, 'name' | 'email' | 'phone' | 'createdAt' | 'dietary' | 'notes'>

export function AdminBookingClientCard({
  booking,
  clientProfile,
}: {
  booking: ClientBooking
  clientProfile: ClientProfileSummary | null
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span aria-hidden>👤</span>
        Client details
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</p>
          <p className="mt-0.5 text-base font-medium text-gray-900">{booking.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created</p>
          <p className="mt-0.5 text-base text-gray-900">
            {new Date(booking.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
          <p className="mt-0.5 text-base text-gray-900">
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
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>
          <p className="mt-0.5 text-base text-gray-900">
            {booking.phone ? (
              <a href={`tel:${booking.phone}`} className="text-navy hover:underline">
                {booking.phone}
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>
      </div>

      {booking.dietary ? (
        <div className="mt-6 border-t border-stone-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Allergies / dietary</p>
          <p className="mt-1 text-sm text-gray-900">{booking.dietary}</p>
        </div>
      ) : null}

      {booking.notes ? (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Kitchen notes & message (from inquiry)
          </p>
          <div className="mt-2 rounded-md border border-blue-100 bg-blue-50/80 p-3">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-stone-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Client profile</p>
        {clientProfile ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-gray-900">{clientProfile.name}</p>
              <p className="text-sm text-gray-600">
                {clientProfile.phone || '—'} · {clientProfile.email || '—'}
              </p>
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
    </div>
  )
}
