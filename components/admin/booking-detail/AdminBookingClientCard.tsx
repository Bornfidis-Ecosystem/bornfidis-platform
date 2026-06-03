import Link from 'next/link'
import type { BookingInquiry } from '@/types/booking'
import { CulinaryCard } from '@/components/culinary-os'

export type ClientProfileSummary = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
}

type ClientBooking = Pick<BookingInquiry, 'name' | 'email' | 'phone' | 'createdAt' | 'dietary' | 'notes'>

const labelClass = 'font-culinary-sans text-label-caps text-culinary-text-muted'
const valueClass = 'mt-0.5 font-culinary-sans text-body-lg font-medium text-culinary-ink'

export function AdminBookingClientCard({
  booking,
  clientProfile,
}: {
  booking: ClientBooking
  clientProfile: ClientProfileSummary | null
}) {
  return (
    <CulinaryCard>
      <h2 className="mb-stack-md flex items-center gap-2 font-culinary-display text-title-md text-culinary-navy">
        <span aria-hidden>👤</span>
        Client details
      </h2>
      <div className="grid gap-gutter sm:grid-cols-2">
        <div>
          <p className={labelClass}>Name</p>
          <p className={valueClass}>{booking.name}</p>
        </div>
        <div>
          <p className={labelClass}>Created</p>
          <p className={`${valueClass} font-normal`}>
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
          <p className={labelClass}>Email</p>
          <p className={`${valueClass} font-normal`}>
            {booking.email ? (
              <a href={`mailto:${booking.email}`} className="text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted">
                {booking.email}
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>
        <div>
          <p className={labelClass}>Phone</p>
          <p className={`${valueClass} font-normal`}>
            {booking.phone ? (
              <a href={`tel:${booking.phone}`} className="text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted">
                {booking.phone}
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>
      </div>

      {booking.dietary ? (
        <div className="mt-stack-md border-t border-culinary-outline pt-stack-md">
          <p className={labelClass}>Allergies / dietary</p>
          <p className="mt-1 font-culinary-sans text-body-md text-culinary-ink">{booking.dietary}</p>
        </div>
      ) : null}

      {booking.notes ? (
        <div className="mt-stack-md border-t border-culinary-outline pt-stack-md">
          <p className={labelClass}>Kitchen notes & message (from inquiry)</p>
          <div className="mt-stack-sm rounded-none border border-culinary-outline bg-culinary-surface-low p-gutter">
            <p className="whitespace-pre-wrap font-culinary-sans text-body-md text-culinary-ink">{booking.notes}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-stack-md border-t border-culinary-outline pt-stack-md">
        <p className={`${labelClass} mb-stack-sm`}>Client profile</p>
        {clientProfile ? (
          <div className="flex flex-wrap items-center justify-between gap-stack-sm">
            <div>
              <p className="font-culinary-sans text-body-lg font-semibold text-culinary-ink">{clientProfile.name}</p>
              <p className="font-culinary-sans text-body-md text-culinary-text-muted">
                {clientProfile.phone || '—'} · {clientProfile.email || '—'}
              </p>
            </div>
            <Link
              href={`/admin/clients/${clientProfile.id}`}
              className="inline-flex items-center rounded-none border border-culinary-navy bg-culinary-bone px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:bg-culinary-navy hover:text-culinary-on-navy"
            >
              View client profile
            </Link>
          </div>
        ) : (
          <p className="font-culinary-sans text-body-md text-culinary-text-muted">No linked client profile.</p>
        )}
      </div>
    </CulinaryCard>
  )
}
