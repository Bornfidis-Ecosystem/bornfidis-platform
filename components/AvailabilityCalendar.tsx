'use client'

import { useState } from 'react'
import type { DayAvailability } from '@/lib/chef-availability'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
  chefId: string
  year: number
  month: number
  days: DayAvailability[]
  chefName?: string
  onSetAvailability: (date: string, available: boolean, note?: string | null) => Promise<{ success: boolean; error?: string }>
}

export default function AvailabilityCalendar({
  chefId,
  year,
  month,
  days,
  chefName,
  onSetAvailability,
}: Props) {
  const [noteModal, setNoteModal] = useState<{ date: string; available: boolean } | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month - 1, 1).getDay()
  const emptyCells = Array(firstDay).fill(null)

  const handleDayClick = (day: DayAvailability) => {
    if (day.hasAssignment) return // don't toggle days that have a booking
    setNoteModal({ date: day.date, available: !day.available })
    setNote(day.note ?? '')
  }

  const handleSubmitNote = async () => {
    if (!noteModal) return
    setSaving(noteModal.date)
    setError(null)
    const result = await onSetAvailability(noteModal.date, noteModal.available, note.trim() || null)
    setSaving(null)
    if (result.success) {
      setNoteModal(null)
      setNote('')
      window.location.reload() // refresh to show new state
    } else {
      setError(result.error ?? 'Failed to save')
    }
  }

  return (
    <div className="space-y-4">
      {chefName && (
        <p className="text-sm text-gray-600">
          Availability for <strong>{chefName}</strong>
        </p>
      )}
      <h2 className="text-xl font-semibold text-gray-900">{monthLabel}</h2>
      <p className="text-xs text-gray-500">
        Click a day to set Available / Unavailable. Days with an existing booking are shown as busy and cannot be toggled.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs font-medium text-gray-500 py-1">
            {w}
          </div>
        ))}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        {days.map((day) => {
          const isBusy = day.hasAssignment
          const isUnavailable = !day.available && !isBusy
          const isSavingThis = saving === day.date
          return (
            <div
              key={day.date}
              className={`
                p-2 rounded border text-sm min-h-[44px] flex flex-col items-center justify-center
                ${isBusy ? 'bg-amber-100 border-amber-300 cursor-default' : 'cursor-pointer'}
                ${!isBusy && isUnavailable ? 'bg-red-50 border-red-200 hover:bg-red-100' : ''}
                ${!isBusy && !isUnavailable ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                ${isSavingThis ? 'opacity-60' : ''}
              `}
              onClick={() => !isBusy && handleDayClick(day)}
              title={day.note ? `Note: ${day.note}` : isBusy ? 'Has booking' : day.available ? 'Available (click to set unavailable)' : 'Unavailable (click to set available)'}
            >
              <span className="font-medium text-gray-800">{new Date(day.date + 'T12:00:00').getDate()}</span>
              {isBusy && <span className="text-xs text-amber-700">Busy</span>}
              {!isBusy && (day.available ? <span className="text-xs text-green-700">OK</span> : <span className="text-xs text-red-700">No</span>)}
            </div>
          )
        })}
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              {noteModal.available ? 'Set available' : 'Set unavailable'} — {noteModal.date}
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional, e.g. &quot;Travel&quot;)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Travel"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setNoteModal(null); setNote(''); setError(null); }}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitNote}
                disabled={!!saving}
                className="px-3 py-1.5 bg-[#1a5f3f] text-white rounded disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
