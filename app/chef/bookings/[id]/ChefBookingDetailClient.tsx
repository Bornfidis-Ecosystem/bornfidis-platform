'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { updateChefStatus, updateChefAssignmentNotes, updatePrep } from '../actions'
import type { ChefBookingStatus } from '@prisma/client'
import { useChefOffline } from '@/components/chef/ChefOfflineProvider'

type PrepItem = { label: string; required: boolean }

type Props = {
  assignmentId: string
  status: ChefBookingStatus
  notes: string | null
  bookingId: string
  booking: {
    id: string
    name: string
    location: string
    eventDate: Date
    eventTime: string | null
    dietaryRestrictions: string | null
    specialRequests: string | null
    menuPreferences: string | null
  }
  prepTemplateName: string | null
  prepItems: PrepItem[]
  prepCompleted: Record<string, boolean>
}

export function ChefBookingDetailClient({
  assignmentId,
  status,
  notes,
  bookingId,
  booking,
  prepTemplateName,
  prepItems,
  prepCompleted: initialCompleted,
}: Props) {
  const router = useRouter()
  const [notesValue, setNotesValue] = useState(notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [completed, setCompleted] = useState<Record<string, boolean>>(initialCompleted)
  const [savingChecklist, setSavingChecklist] = useState(false)

  const completedCount = Object.values(completed).filter(Boolean).length
  const progressLabel = prepItems.length > 0 ? `${completedCount}/${prepItems.length} complete` : null
  const requiredIndices = prepItems.map((p, i) => (p.required ? i : -1)).filter((i) => i >= 0)
  const allRequiredChecked = requiredIndices.every((i) => completed[String(i)] === true)

  const handleToggleItem = useCallback(
    async (index: number) => {
      const key = String(index)
      const next = { ...completed, [key]: !completed[key] }
      setCompleted(next)
      setSavingChecklist(true)
      const res = await updatePrep(bookingId, next)
      setSavingChecklist(false)
      if (res.success) router.refresh()
      else {
        setCompleted(completed)
        alert(res.error || 'Failed to save')
      }
    },
    [bookingId, completed, router]
  )

  async function handleStatus(newStatus: ChefBookingStatus) {
    const res = await updateChefStatus(assignmentId, newStatus)
    if (res.success) router.refresh()
    else alert(res.error || 'Failed to update')
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const res = await updateChefAssignmentNotes(assignmentId, notesValue || null)
    setSavingNotes(false)
    if (res.success) router.refresh()
    else alert(res.error || 'Failed to save notes')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Booking summary */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Booking summary
        </h2>
        <p className="font-medium text-gray-900">{booking.name}</p>
        <p className="text-sm text-gray-500">{booking.location}</p>
        <p className="text-sm text-gray-500">
          {new Date(booking.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          {booking.eventTime ? ` at ${booking.eventTime}` : ''}
        </p>
        <p className="mt-2 text-xs font-medium text-gray-500 uppercase">Status</p>
        {dataStale && (
          <p className="text-xs text-amber-700 mt-1">Data may be stale — connect to sync.</p>
        )}
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
            statusDisplay === 'COMPLETED'
              ? 'bg-green-100 text-green-800'
              : statusDisplay === 'IN_PREP'
                ? 'bg-blue-100 text-blue-800'
                : statusDisplay === 'CONFIRMED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusDisplay.replace('_', ' ')}
        </span>
      </section>

      {/* Menu / requirements */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Menu & requirements
        </h2>
        {booking.dietaryRestrictions && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Dietary:</span> {booking.dietaryRestrictions}
          </p>
        )}
        {booking.menuPreferences && (
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Menu preferences:</span> {booking.menuPreferences}
          </p>
        )}
        {booking.specialRequests && (
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Special requests:</span> {booking.specialRequests}
          </p>
        )}
        {!booking.dietaryRestrictions && !booking.menuPreferences && !booking.specialRequests && (
          <p className="text-sm text-gray-500">No specific requirements listed.</p>
        )}
      </section>

      {/* Prep checklist (Phase 2K — template-driven, savable) */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Prep checklist
            {prepTemplateName && (
              <span className="ml-2 font-normal normal-case text-gray-500">({prepTemplateName})</span>
            )}
          </h2>
          {progressLabel && (
            <span className="text-xs font-medium text-gray-500">{progressLabel}</span>
          )}
        </div>
        {prepItems.length === 0 ? (
          <p className="text-sm text-gray-500">No checklist template loaded. Admin can add templates.</p>
        ) : (
          <ul className="space-y-1">
            {prepItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3 min-h-[44px] py-1">
                <input
                  type="checkbox"
                  id={`prep-${i}`}
                  checked={completed[String(i)] === true}
                  onChange={() => handleToggleItem(i)}
                  disabled={savingChecklist}
                  className="h-6 w-6 rounded border-gray-300 text-green-600 focus:ring-green-500 touch-manipulation flex-shrink-0"
                />
                <label htmlFor={`prep-${i}`} className="text-sm text-gray-700 cursor-pointer flex-1 py-2">
                  {item.label}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Your notes
        </h2>
        <textarea
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="Prep notes, timing, issues..."
        />
        <button
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="mt-2 rounded bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {savingNotes ? 'Saving...' : 'Save notes'}
        </button>
      </section>

      {/* Status actions */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Status
        </h2>
        <div className="flex flex-wrap gap-2">
          {statusDisplay === 'ASSIGNED' && (
            <button
              type="button"
              onClick={() => handleStatus('CONFIRMED')}
              disabled={dataStale}
              className="min-h-[44px] rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 touch-manipulation disabled:opacity-50"
            >
              Confirm availability
            </button>
          )}
          {statusDisplay === 'CONFIRMED' && (
            <button
              type="button"
              onClick={() => handleStatus('IN_PREP')}
              disabled={dataStale}
              className="min-h-[44px] rounded-lg bg-amber-600 px-5 py-3 text-sm font-medium text-white hover:bg-amber-700 touch-manipulation disabled:opacity-50"
            >
              Start prep
            </button>
          )}
          {statusDisplay === 'IN_PREP' && (
            <>
              {prepItems.length > 0 && !allRequiredChecked && (
                <p className="text-xs text-amber-700 w-full">
                  Complete all required checklist items (*) before marking job complete.
                </p>
              )}
              <button
                type="button"
                onClick={() => handleStatus('COMPLETED')}
                disabled={(prepItems.length > 0 && !allRequiredChecked) || dataStale}
                className="min-h-[44px] rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Mark job complete
              </button>
            </>
          )}
          {statusDisplay === 'COMPLETED' && (
            <span className="text-sm text-green-700 font-medium">Job completed</span>
          )}
        </div>
      </section>

      <Link href="/chef/bookings" className="text-sm text-green-700 hover:underline">
        ← Back to bookings
      </Link>
    </div>
  )
}
