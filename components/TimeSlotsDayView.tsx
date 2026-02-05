'use client'

import { useState } from 'react'
import { SLOT_PRESETS } from '@/lib/chef-time-slots'
import type { TimeSlotRow } from '@/lib/chef-time-slots'

type Props = {
  chefId: string
  date: string
  slots: TimeSlotRow[]
  onAddSlot: (date: string, startTime: string, endTime: string) => Promise<{ success: boolean; error?: string }>
  onUpdateSlot: (slotId: string, available: boolean) => Promise<{ success: boolean; error?: string }>
  onDeleteSlot: (slotId: string) => Promise<{ success: boolean; error?: string }>
  isAdmin?: boolean
  bookingsOnDay?: Array<{ booking: { eventTime: string | null; name: string } }>
}

export default function TimeSlotsDayView({
  chefId,
  date,
  slots,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  isAdmin,
  bookingsOnDay = [],
}: Props) {
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleAddPreset(preset: keyof typeof SLOT_PRESETS) {
    const { start, end } = SLOT_PRESETS[preset]
    setAdding(preset)
    setError(null)
    const result = await onAddSlot(date, start, end)
    setAdding(null)
    if (result.success) window.location.reload()
    else setError(result.error ?? 'Failed')
  }

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Time slots — {dateLabel}</h3>
      <p className="text-xs text-gray-500 mb-3">
        Add preset blocks or custom slots. Bookings will only be allowed within available slots. No overlapping slots.
      </p>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(SLOT_PRESETS) as Array<keyof typeof SLOT_PRESETS>).map((preset) => {
          const { start, end } = SLOT_PRESETS[preset]
          const exists = slots.some(
            (s) => s.startTime === start && s.endTime === end
          )
          return (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddPreset(preset)}
              disabled={exists || adding !== null}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding === preset ? 'Adding…' : `${preset} (${start}–${end})`}
            </button>
          )
        })}
      </div>
      {bookingsOnDay.length > 0 && (
        <div className="mb-3 text-sm text-amber-700">
          Bookings this day: {bookingsOnDay.map((a: any) => a.booking?.name || 'Booking').join(', ')}
          {bookingsOnDay.some((a: any) => a.booking?.eventTime) && (
            <span className="ml-1">
              ({bookingsOnDay.map((a: any) => a.booking?.eventTime).filter(Boolean).join(', ')})
            </span>
          )}
        </div>
      )}
      {slots.length === 0 ? (
        <p className="text-sm text-gray-500">No time slots yet. Add a preset above.</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className={`flex items-center justify-between gap-2 py-2 px-3 rounded border text-sm ${
                slot.available ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <span className="font-mono">
                {slot.startTime} – {slot.endTime}
              </span>
              <span className={slot.available ? 'text-green-700' : 'text-gray-500'}>
                {slot.available ? 'Available' : 'Off'}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={async () => {
                    const r = await onUpdateSlot(slot.id, !slot.available)
                    if (r.success) window.location.reload()
                    else setError(r.error ?? 'Failed')
                  }}
                  className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  {slot.available ? 'Turn off' : 'Turn on'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Delete this slot?')) return
                    const r = await onDeleteSlot(slot.id)
                    if (r.success) window.location.reload()
                    else setError(r.error ?? 'Failed')
                  }}
                  className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
