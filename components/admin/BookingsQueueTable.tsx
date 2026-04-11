'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { buildReminderText, type ReminderType } from '@/lib/reminders/buildReminderText'
import { bulkReminderLabel } from '@/lib/bookings/query-filters'
import type { BookingStatus } from '@/types/booking'

export type BookingsQueueRow = {
  id: string
  name: string
  email?: string | null
  event_date: string
  status: string
  createdAt: string
}

function getStatusBadgeColor(status: string) {
  const s = status as BookingStatus
  switch (s) {
    case 'pending':
    case 'New':
      return 'bg-blue-100 text-blue-800'
    case 'reviewed':
    case 'Contacted':
      return 'bg-yellow-100 text-yellow-800'
    case 'quoted':
      return 'bg-purple-100 text-purple-800'
    case 'booked':
    case 'Confirmed':
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'declined':
    case 'Closed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function escapeCsvCell(v: string) {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

type Props = {
  rows: BookingsQueueRow[]
  bulkReminderType: ReminderType | null
}

const BULK_SEPARATOR = '\n\n────────\n\n'

export default function BookingsQueueTable({ rows, bulkReminderType }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setSelected(new Set())
  }, [rows])

  const allIds = useMemo(() => rows.map((r) => r.id), [rows])
  const selectedCount = selected.size
  const allSelected = rows.length > 0 && selectedCount === rows.length

  const toggleOne = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(
    (checked: boolean) => {
      if (checked) setSelected(new Set(allIds))
      else setSelected(new Set())
    },
    [allIds]
  )

  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected])

  const copyBulk = useCallback(
    async (channel: 'whatsapp' | 'email') => {
      if (!bulkReminderType || selectedRows.length === 0) return
      const key = channel === 'whatsapp' ? 'whatsapp' : 'email'
      const parts = selectedRows.map((r) =>
        buildReminderText({
          type: bulkReminderType,
          name: r.name,
          eventDate: r.event_date,
        })[key]
      )
      const text = parts.join(BULK_SEPARATOR)
      try {
        await navigator.clipboard.writeText(text)
        toast.success(
          `Copied ${selectedRows.length} ${channel === 'whatsapp' ? 'WhatsApp' : 'email'} message${selectedRows.length === 1 ? '' : 's'} (${bulkReminderLabel(bulkReminderType)})`
        )
      } catch {
        toast.error('Could not copy to clipboard')
      }
    },
    [bulkReminderType, selectedRows]
  )

  const exportCsv = useCallback(() => {
    if (selectedRows.length === 0) return
    const header = ['id', 'name', 'email', 'event_date', 'status', 'created_at']
    const lines = [
      header.join(','),
      ...selectedRows.map((r) =>
        [
          escapeCsvCell(r.id),
          escapeCsvCell(r.name),
          escapeCsvCell(r.email ?? ''),
          escapeCsvCell(r.event_date),
          escapeCsvCell(r.status),
          escapeCsvCell(r.createdAt),
        ].join(',')
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-export-${selectedRows.length}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${selectedRows.length} row${selectedRows.length === 1 ? '' : 's'}`)
  }, [selectedRows])

  const bulkDisabled = selectedCount === 0 || !bulkReminderType

  return (
    <div className="overflow-hidden">
      <div className="border-b border-stone-200 bg-stone-50 px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-700">
            <span className="font-medium tabular-nums">
              {selectedCount} selected
              <span className="text-stone-400 font-normal"> / {rows.length} in view</span>
            </span>
            {!bulkReminderType && (
              <span className="text-xs text-stone-500 max-w-xl">
                Bulk reminder copy is available on queues like{' '}
                <strong className="text-stone-700">Deposit pending</strong> or{' '}
                <strong className="text-stone-700">Testimonial follow-up</strong> (also balance pending &amp; prep
                incomplete).
              </span>
            )}
            {bulkReminderType && (
              <span className="text-xs text-stone-600">
                Template: <strong className="text-navy">{bulkReminderLabel(bulkReminderType)}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkDisabled}
              onClick={() => void copyBulk('whatsapp')}
              className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Copy WhatsApp
            </button>
            <button
              type="button"
              disabled={bulkDisabled}
              onClick={() => void copyBulk('email')}
              className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Copy Email
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={exportCsv}
              className="inline-flex items-center rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-navy focus:ring-navy"
                  aria-label="Select all in this view"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition">
                <td className="pl-4 pr-2 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(booking.id)}
                    onChange={(e) => toggleOne(booking.id, e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-navy focus:ring-navy"
                    aria-label={`Select ${booking.name}`}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.email || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(booking.event_date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDateTime(booking.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="px-3 py-1 bg-navy text-white rounded hover:bg-opacity-90 transition text-xs font-semibold"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
