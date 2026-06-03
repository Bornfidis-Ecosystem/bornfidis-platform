'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateChefStatus } from './actions'
import type { ChefBookingStatus } from '@prisma/client'

type Assignment = {
  id: string
  status: ChefBookingStatus
  notes: string | null
  booking: {
    id: string
    name: string
    location: string
    eventDate: Date
    eventTime: string | null
    dietaryRestrictions: string | null
    specialRequests: string | null
  }
}

export function ChefBookingsClient({ assignments }: { assignments: Assignment[] }) {
  const router = useRouter()

  async function handleStatus(assignmentId: string, status: ChefBookingStatus) {
    const res = await updateChefStatus(assignmentId, status)
    if (res.success) router.refresh()
    else alert(res.error || 'Failed to update')
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No bookings assigned yet. When admin assigns you to a booking, it will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assignments.map((a) => (
        <div
          key={a.id}
          className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <Link
            href={`/chef/bookings/${a.booking.id}`}
            className="min-w-0 flex-1 block"
          >
            <p className="font-medium text-gray-900">{a.booking.name}</p>
            <p className="text-sm text-gray-500">{a.booking.location}</p>
            <p className="text-sm text-gray-500">
              {new Date(a.booking.eventDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {a.booking.eventTime ? ` at ${a.booking.eventTime}` : ''}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                a.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : a.status === 'IN_PREP'
                    ? 'bg-blue-100 text-blue-800'
                    : a.status === 'CONFIRMED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {a.status.replace('_', ' ')}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/chef/bookings/${a.booking.id}`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 touch-manipulation"
            >
              View
            </Link>
            {a.status === 'ASSIGNED' && (
              <button
                type="button"
                onClick={() => handleStatus(a.id, 'CONFIRMED')}
                className="min-h-[44px] min-w-[44px] rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 touch-manipulation"
              >
                Confirm
              </button>
            )}
            {a.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={() => handleStatus(a.id, 'IN_PREP')}
                className="min-h-[44px] min-w-[44px] rounded-lg bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-700 touch-manipulation"
              >
                Start Prep
              </button>
            )}
            {a.status === 'IN_PREP' && (
              <button
                type="button"
                onClick={() => handleStatus(a.id, 'COMPLETED')}
                className="min-h-[44px] min-w-[44px] rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 touch-manipulation"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

