'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { BookingInquiry, BookingStatus } from '@/types/booking'
import {
  PIPELINE_COLUMNS,
  getColumnIdForStatus,
  COLUMN_TO_STATUS,
  type PipelineColumnId,
} from '@/lib/provisions-pipeline'
import { updateBooking } from '@/app/admin/bookings/actions'

export function ProvisionsPipelineBoard({
  initialBookings,
}: {
  initialBookings: BookingInquiry[]
}) {
  const [bookings, setBookings] = useState(initialBookings)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bookingsByColumn = PIPELINE_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = bookings.filter((b) => getColumnIdForStatus(b.status) === col.id)
      return acc
    },
    {} as Record<PipelineColumnId, BookingInquiry[]>
  )

  async function handleStatusChange(bookingId: string, newColumnId: PipelineColumnId) {
    const newStatus = COLUMN_TO_STATUS[newColumnId]
    setUpdatingId(bookingId)
    setError(null)
    const result = await updateBooking(bookingId, { status: newStatus as BookingStatus })
    setUpdatingId(null)
    if (!result.success) {
      setError(result.error ?? 'Failed to update status')
      return
    }
    if (result.booking) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? result.booking! : b)),
      )
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {PIPELINE_COLUMNS.map((col) => (
          <div
            key={col.id}
            className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col min-h-[320px]"
          >
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">{col.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {bookingsByColumn[col.id].length} booking
                {bookingsByColumn[col.id].length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {bookingsByColumn[col.id].map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  currentColumnId={col.id}
                  onStatusChange={handleStatusChange}
                  isUpdating={updatingId === booking.id}
                />
              ))}
              {bookingsByColumn[col.id].length === 0 && (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  No bookings
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BookingCard({
  booking,
  currentColumnId,
  onStatusChange,
  isUpdating,
}: {
  booking: BookingInquiry
  currentColumnId: PipelineColumnId
  onStatusChange: (bookingId: string, newColumnId: PipelineColumnId) => void
  isUpdating: boolean
}) {
  const valueCents = booking.quote_total_cents ?? booking.total_cents ?? 0
  const valueDisplay =
    valueCents > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: booking.quote_currency ?? 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(valueCents / 100)
      : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:border-gray-300 transition">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-sm font-medium text-navy hover:underline truncate flex-1 min-w-0"
        >
          {booking.name}
        </Link>
      </div>
      {booking.email && (
        <p className="text-xs text-gray-600 mt-1 truncate" title={booking.email}>
          {booking.email}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {formatDate(booking.event_date)}
        {booking.event_time ? ` · ${booking.event_time}` : ''}
      </p>
      {booking.location && (
        <p className="text-xs text-gray-500 truncate mt-0.5" title={booking.location}>
          {booking.location}
        </p>
      )}
      {valueDisplay && (
        <p className="text-xs font-medium text-green-700 mt-1">{valueDisplay}</p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <label htmlFor={`status-${booking.id}`} className="sr-only">
          Move to column
        </label>
        <select
          id={`status-${booking.id}`}
          value={currentColumnId}
          disabled={isUpdating}
          onChange={(e) =>
            onStatusChange(booking.id, e.target.value as PipelineColumnId)
          }
          className="block w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy disabled:opacity-60"
        >
          {PIPELINE_COLUMNS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
