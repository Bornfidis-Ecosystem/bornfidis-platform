'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { updateBookingChecklistItem } from '../actions'
import type { BookingInquiry } from '@/types/booking'
import type { BookingActivity } from '@/types/booking-activity'
import {
  BOOKING_CHECKLIST_WRITABLE_KEYS,
  BOOKING_CHECKLIST_ITEM_TITLES,
  type BookingChecklistWritableKey,
} from '@/lib/bookings/checklist'

type Props = {
  booking: BookingInquiry
  onActivity?: (activity: BookingActivity) => void
}

function writableKeyToBookingField(k: BookingChecklistWritableKey): keyof BookingInquiry {
  const map: Record<BookingChecklistWritableKey, keyof BookingInquiry> = {
    menuConfirmed: 'menu_confirmed',
    dietaryConfirmed: 'dietary_confirmed',
    guestCountConfirmed: 'guest_count_confirmed',
    arrivalTimeConfirmed: 'arrival_time_confirmed',
    locationConfirmed: 'location_confirmed',
    ingredientsSourced: 'ingredients_sourced',
    equipmentPacked: 'equipment_packed',
  }
  return map[k]
}

export default function ServiceChecklistSection({ booking, onActivity }: Props) {
  const [pendingKey, setPendingKey] = useState<BookingChecklistWritableKey | null>(null)
  const [local, setLocal] = useState(() =>
    Object.fromEntries(
      BOOKING_CHECKLIST_WRITABLE_KEYS.map((k) => [
        k,
        Boolean(booking[writableKeyToBookingField(k)]),
      ])
    ) as Record<BookingChecklistWritableKey, boolean>
  )

  useEffect(() => {
    setLocal(
      Object.fromEntries(
        BOOKING_CHECKLIST_WRITABLE_KEYS.map((k) => [
          k,
          Boolean(booking[writableKeyToBookingField(k)]),
        ])
      ) as Record<BookingChecklistWritableKey, boolean>
    )
  }, [booking])

  const depositReceived = Boolean(booking.paid_at)
  const finalBalanceCollected = Boolean(booking.balance_paid_at || booking.fully_paid_at)
  const testimonialRequested = Boolean(booking.testimonial_requested_at)

  const { done, total, pct } = useMemo(() => {
    let d = 0
    const t = 10
    for (const k of BOOKING_CHECKLIST_WRITABLE_KEYS) {
      if (local[k]) d += 1
    }
    if (depositReceived) d += 1
    if (finalBalanceCollected) d += 1
    if (testimonialRequested) d += 1
    return { done: d, total: t, pct: Math.round((d / t) * 100) }
  }, [local, depositReceived, finalBalanceCollected, testimonialRequested])

  const toggle = useCallback(
    async (key: BookingChecklistWritableKey, next: boolean) => {
      setPendingKey(key)
      try {
        const res = await updateBookingChecklistItem({ bookingId: booking.id, key, value: next })
        if (!res.success) {
          toast.error(res.error || 'Could not update checklist')
          return
        }
        setLocal((prev) => ({ ...prev, ...res.checklist }))
        if (res.activity && onActivity) {
          onActivity(res.activity)
        }
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Could not update checklist')
      } finally {
        setPendingKey(null)
      }
    },
    [booking.id, onActivity]
  )

  return (
    <div className="bg-white border border-stone-200 rounded-lg mb-6 shadow-sm">
      <div className="px-5 py-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-navy">Service Checklist</h2>
        <p className="text-xs text-stone-500 mt-1">
          Track prep and confirmations. Deposit, balance, and testimonial request reflect live booking data.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-stone-700 tabular-nums">
            {done} / {total} complete
          </span>
          <div className="flex-1 min-w-[120px] max-w-md h-2 rounded-full bg-stone-100 overflow-hidden border border-stone-200/80">
            <div
              className="h-full rounded-full bg-[#1A3C34] transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-stone-500 tabular-nums">{pct}%</span>
        </div>
      </div>

      <ul className="divide-y divide-stone-100 px-5 py-2">
        {BOOKING_CHECKLIST_WRITABLE_KEYS.map((key) => (
          <li key={key} className="flex items-start gap-3 py-2.5">
            <input
              type="checkbox"
              id={`checklist-${key}`}
              checked={local[key]}
              disabled={pendingKey === key}
              onChange={(e) => void toggle(key, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-navy focus:ring-navy"
            />
            <label
              htmlFor={`checklist-${key}`}
              className="text-sm text-stone-800 leading-snug cursor-pointer select-none"
            >
              {BOOKING_CHECKLIST_ITEM_TITLES[key]}
            </label>
          </li>
        ))}

        <li className="flex items-start gap-3 py-2.5 opacity-90">
          <input
            type="checkbox"
            checked={depositReceived}
            readOnly
            disabled
            tabIndex={-1}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-400"
            aria-readonly="true"
          />
          <div className="text-sm leading-snug">
            <span className="text-stone-800">{BOOKING_CHECKLIST_ITEM_TITLES.depositReceived}</span>
            <span className="block text-[11px] text-stone-500 mt-0.5">From payment: deposit recorded (paid date)</span>
          </div>
        </li>

        <li className="flex items-start gap-3 py-2.5 opacity-90">
          <input
            type="checkbox"
            checked={finalBalanceCollected}
            readOnly
            disabled
            tabIndex={-1}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-400"
            aria-readonly="true"
          />
          <div className="text-sm leading-snug">
            <span className="text-stone-800">{BOOKING_CHECKLIST_ITEM_TITLES.finalBalanceCollected}</span>
            <span className="block text-[11px] text-stone-500 mt-0.5">From payment: balance or full payment timestamp</span>
          </div>
        </li>

        <li className="flex items-start gap-3 py-2.5 opacity-90">
          <input
            type="checkbox"
            checked={testimonialRequested}
            readOnly
            disabled
            tabIndex={-1}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-400"
            aria-readonly="true"
          />
          <div className="text-sm leading-snug">
            <span className="text-stone-800">{BOOKING_CHECKLIST_ITEM_TITLES.testimonialRequested}</span>
            <span className="block text-[11px] text-stone-500 mt-0.5">From booking: testimonial requested timestamp</span>
          </div>
        </li>
      </ul>
    </div>
  )
}
