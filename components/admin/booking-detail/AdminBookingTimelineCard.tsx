'use client'

import type { FormEvent } from 'react'
import BookingTimeline from '@/components/admin/BookingTimeline'
import type { BookingActivity } from '@/types/booking-activity'
import { CulinaryCard } from '@/components/culinary-os'

type AdminBookingTimelineCardProps = {
  activities: BookingActivity[]
  internalNote: string
  onInternalNoteChange: (value: string) => void
  onAddInternalNote: (e: FormEvent) => void | Promise<void>
  isAddingInternalNote: boolean
}

const btnPrimary =
  'rounded-none border border-culinary-navy bg-culinary-navy px-4 py-2 font-culinary-sans text-label-caps text-culinary-on-navy transition refined hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
const btnGhost =
  'rounded-none border border-culinary-navy bg-culinary-bone px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:bg-culinary-navy hover:text-culinary-on-navy disabled:cursor-not-allowed disabled:opacity-50'

export function AdminBookingTimelineCard({
  activities,
  internalNote,
  onInternalNoteChange,
  onAddInternalNote,
  isAddingInternalNote,
}: AdminBookingTimelineCardProps) {
  return (
    <CulinaryCard as="section">
      <h2 className="mb-stack-md flex items-center gap-2 font-culinary-display text-title-md text-culinary-navy">
        <span aria-hidden>🕐</span>
        Timeline
      </h2>
      <BookingTimeline activities={activities} />
      <form onSubmit={onAddInternalNote} className="mt-stack-md space-y-stack-sm border-t border-culinary-outline pt-stack-md">
        <label htmlFor="internal_timeline_note" className="block font-culinary-sans text-body-md font-medium text-culinary-ink">
          Add internal note
        </label>
        <textarea
          id="internal_timeline_note"
          value={internalNote}
          onChange={(e) => onInternalNoteChange(e.target.value)}
          rows={3}
          placeholder="Quick note for the activity log (e.g. client called, follow-up planned)…"
          className="w-full resize-y rounded-none border border-culinary-outline bg-culinary-bone px-gutter py-3 font-culinary-sans text-body-md text-culinary-ink focus:border-culinary-forest focus:outline-none focus:ring-1 focus:ring-culinary-forest/40"
        />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={isAddingInternalNote} className={btnPrimary}>
            {isAddingInternalNote ? 'Saving…' : 'Add note'}
          </button>
          <button
            type="button"
            onClick={() => onInternalNoteChange('')}
            disabled={isAddingInternalNote || internalNote.length === 0}
            className={btnGhost}
          >
            Clear
          </button>
        </div>
      </form>
    </CulinaryCard>
  )
}
