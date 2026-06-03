'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateChefStatus } from './bookings/actions'
import type { ChefBookingStatus } from '@prisma/client'
import type { NextBooking } from '@/lib/chef-mobile'

type Props = {
  nextBooking: NextBooking | null
  earningsCents: number
  badgeCount: number
  performanceLine: string | null
  educationPrompt: boolean
}

export function ChefMobileHome({
  nextBooking,
  earningsCents,
  badgeCount,
  performanceLine,
  educationPrompt,
}: Props) {
  const router = useRouter()

  async function handleStatus(assignmentId: string, status: ChefBookingStatus) {
    const res = await updateChefStatus(assignmentId, status)
    if (res.success) router.refresh()
    else alert(res.error || 'Failed')
  }

  return (
    <div className="space-y-4 md:max-w-xl">
      {/* Next booking + primary action — no scroll required on mobile */}
      {nextBooking ? (
        <section className="rounded-xl border-2 border-forestDark/20 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Next booking</p>
          <p className="mt-1 font-semibold text-gray-900">{nextBooking.name}</p>
          <p className="text-sm text-gray-600">
            {new Date(nextBooking.eventDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
            {nextBooking.eventTime ? ` at ${nextBooking.eventTime}` : ''}
          </p>
          <p className="text-sm text-gray-600">{nextBooking.location}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nextBooking.status === 'ASSIGNED' && (
              <button
                type="button"
                onClick={() => handleStatus(nextBooking.assignmentId, 'CONFIRMED')}
                className="min-h-[44px] min-w-[44px] px-5 py-3 rounded-lg bg-forestDark text-white font-semibold touch-manipulation"
              >
                Confirm
              </button>
            )}
            {nextBooking.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={() => handleStatus(nextBooking.assignmentId, 'IN_PREP')}
                className="min-h-[44px] min-w-[44px] px-5 py-3 rounded-lg bg-amber-600 text-white font-semibold touch-manipulation"
              >
                Start Prep
              </button>
            )}
            {nextBooking.status === 'IN_PREP' && (
              <button
                type="button"
                onClick={() => handleStatus(nextBooking.assignmentId, 'COMPLETED')}
                className="min-h-[44px] min-w-[44px] px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold touch-manipulation"
              >
                Complete
              </button>
            )}
            <Link
              href={`/chef/bookings/${nextBooking.bookingId}`}
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 touch-manipulation"
            >
              View details
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">No upcoming bookings.</p>
          <Link
            href="/chef/bookings"
            className="mt-2 inline-block text-sm font-medium text-forestDark hover:underline"
          >
            View all bookings
          </Link>
        </section>
      )}

      {/* Earnings snapshot — month to date */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Earnings this month</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          ${(earningsCents / 100).toFixed(2)}
        </p>
        <Link
          href="/chef/payouts"
          className="mt-1 inline-block text-sm font-medium text-forestDark hover:underline"
        >
          View payouts
        </Link>
      </section>

      {/* Performance & Education lite */}
      {badgeCount > 0 && (
        <section className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1">
          <span className="text-xs font-medium text-gray-500 shrink-0">Badges:</span>
          <div className="flex gap-1" aria-label={`${badgeCount} badges earned`}>
            {Array.from({ length: Math.min(badgeCount, 8) }).map((_, i) => (
              <span key={i} className="w-8 h-8 rounded-full bg-forestDark/20 flex items-center justify-center text-sm" aria-hidden>✓</span>
            ))}
          </div>
          <Link href="/chef" className="shrink-0 text-xs text-forestDark font-medium">All</Link>
        </section>
      )}
      {performanceLine && (
        <p className="text-sm text-gray-600">{performanceLine}</p>
      )}
      {educationPrompt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">Complete required education to unlock payouts.</p>
          <Link href="/chef/education" className="text-sm font-medium text-amber-800 underline mt-1 inline-block">
            Go to Education
          </Link>
        </div>
      )}

      <p className="text-xs text-gray-400 pt-2">
        Status change alerts by email/WhatsApp. Daily reminder if prep incomplete.
      </p>
    </div>
  )
}

