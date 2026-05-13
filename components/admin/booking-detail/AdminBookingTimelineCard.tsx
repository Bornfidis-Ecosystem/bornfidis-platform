'use client'

import type { FormEvent } from 'react'
import BookingTimeline from '@/components/admin/BookingTimeline'
import type { BookingActivity } from '@/types/booking-activity'

type AdminBookingTimelineCardProps = {
  activities: BookingActivity[]
  internalNote: string
  onInternalNoteChange: (value: string) => void
  onAddInternalNote: (e: FormEvent) => void | Promise<void>
  isAddingInternalNote: boolean
}

export function AdminBookingTimelineCard({
  activities,
  internalNote,
  onInternalNoteChange,
  onAddInternalNote,
  isAddingInternalNote,
}: AdminBookingTimelineCardProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span aria-hidden>🕐</span>
        Timeline
      </h2>
      <BookingTimeline activities={activities} />
      <form onSubmit={onAddInternalNote} className="mt-6 space-y-2 border-t border-stone-100 pt-4">
        <label htmlFor="internal_timeline_note" className="block text-sm font-medium text-gray-700">
          Add internal note
        </label>
        <textarea
          id="internal_timeline_note"
          value={internalNote}
          onChange={(e) => onInternalNoteChange(e.target.value)}
          rows={3}
          placeholder="Quick note for the activity log (e.g. client called, follow-up planned)…"
          className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isAddingInternalNote}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAddingInternalNote ? 'Saving…' : 'Add note'}
          </button>
          <button
            type="button"
            onClick={() => onInternalNoteChange('')}
            disabled={isAddingInternalNote || internalNote.length === 0}
            className="rounded-lg border border-navy/20 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>
    </section>
  )
}
