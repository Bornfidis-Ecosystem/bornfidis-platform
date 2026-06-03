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

function getStatusBadgeClass(status: string) {
  const s = status as BookingStatus
  const base = 'inline-flex items-center rounded-none border px-2 py-1 text-xs font-semibold'
  switch (s) {
    case 'pending':
    case 'New':
    case 'new_inquiry':
      return `${base} border-culinary-outline-variant bg-culinary-surface-high text-culinary-navy`
    case 'reviewed':
    case 'Contacted':
      return `${base} border-culinary-gold-line bg-culinary-bone text-culinary-navy`
    case 'quoted':
    case 'Quote Sent':
    case 'quote_sent':
      return `${base} border-culinary-outline bg-culinary-surface-low text-culinary-navy`
    case 'booked':
    case 'Confirmed':
    case 'confirmed':
    case 'in_prep':
    case 'Completed':
    case 'completed':
      return `${base} border-culinary-forest/40 bg-culinary-bone text-culinary-forest`
    case 'declined':
    case 'Closed':
    case 'cancelled':
    case 'Cancelled':
    case 'Canceled':
      return `${base} border-culinary-outline bg-culinary-surface-low text-culinary-text-muted`
    default:
      return `${base} border-culinary-outline bg-culinary-surface-low text-culinary-ink`
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

  const btnBase =
    'inline-flex items-center rounded-none border px-3 py-1.5 font-culinary-sans text-label-caps transition refined disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="overflow-hidden">
      <div className="space-y-stack-sm border-b border-culinary-outline bg-culinary-surface-low px-gutter py-stack-sm">
        <div className="flex flex-wrap items-center justify-between gap-stack-sm">
          <div className="flex flex-wrap items-center gap-stack-sm font-culinary-sans text-body-md text-culinary-ink">
            <span className="font-medium tabular-nums">
              {selectedCount} selected
              <span className="font-normal text-culinary-text-muted"> / {rows.length} in view</span>
            </span>
            {!bulkReminderType && (
              <span className="max-w-xl text-xs text-culinary-text-muted">
                Bulk reminder copy is available on queues like{' '}
                <strong className="text-culinary-navy">Deposit pending</strong> or{' '}
                <strong className="text-culinary-navy">Testimonial follow-up</strong> (also balance pending &amp; prep
                incomplete).
              </span>
            )}
            {bulkReminderType && (
              <span className="text-xs text-culinary-text-muted">
                Template: <strong className="text-culinary-navy">{bulkReminderLabel(bulkReminderType)}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkDisabled}
              onClick={() => void copyBulk('whatsapp')}
              className={`${btnBase} border-culinary-forest bg-culinary-forest text-white hover:bg-culinary-forest/90`}
            >
              Copy WhatsApp
            </button>
            <button
              type="button"
              disabled={bulkDisabled}
              onClick={() => void copyBulk('email')}
              className={`${btnBase} border-culinary-outline bg-culinary-bone text-culinary-navy hover:bg-culinary-surface-high`}
            >
              Copy Email
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={exportCsv}
              className={`${btnBase} border-culinary-navy bg-culinary-bone text-culinary-navy hover:bg-culinary-navy hover:text-culinary-on-navy`}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-culinary-outline bg-culinary-surface-low">
            <tr>
              <th className="w-10 py-3 pl-gutter pr-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="h-4 w-4 rounded-none border-culinary-outline text-culinary-navy focus:ring-culinary-navy"
                  aria-label="Select all in this view"
                />
              </th>
              <th className="px-gutter py-3 text-left font-culinary-sans text-label-caps text-culinary-text-muted">
                Name
              </th>
              <th className="px-gutter py-3 text-left font-culinary-sans text-label-caps text-culinary-text-muted">
                Email
              </th>
              <th className="px-gutter py-3 text-left font-culinary-sans text-label-caps text-culinary-text-muted">
                Event date
              </th>
              <th className="px-gutter py-3 text-left font-culinary-sans text-label-caps text-culinary-text-muted">
                Status
              </th>
              <th className="px-gutter py-3 text-left font-culinary-sans text-label-caps text-culinary-text-muted">
                Created at
              </th>
              <th className="px-gutter py-3 text-left font-culinary-sans text-label-caps text-culinary-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-culinary-outline bg-culinary-bone">
            {rows.map((booking) => (
              <tr key={booking.id} className="transition refined hover:bg-culinary-surface-low">
                <td className="py-4 pl-gutter pr-2">
                  <input
                    type="checkbox"
                    checked={selected.has(booking.id)}
                    onChange={(e) => toggleOne(booking.id, e.target.checked)}
                    className="h-4 w-4 rounded-none border-culinary-outline text-culinary-navy focus:ring-culinary-navy"
                    aria-label={`Select ${booking.name}`}
                  />
                </td>
                <td className="whitespace-nowrap px-gutter py-4">
                  <div className="font-culinary-sans text-body-md font-medium text-culinary-ink">{booking.name}</div>
                </td>
                <td className="whitespace-nowrap px-gutter py-4">
                  <div className="font-culinary-sans text-body-md text-culinary-ink">{booking.email || '—'}</div>
                </td>
                <td className="whitespace-nowrap px-gutter py-4">
                  <div className="font-culinary-sans text-body-md text-culinary-ink">{formatDate(booking.event_date)}</div>
                </td>
                <td className="whitespace-nowrap px-gutter py-4">
                  <span className={getStatusBadgeClass(booking.status)}>{booking.status}</span>
                </td>
                <td className="whitespace-nowrap px-gutter py-4">
                  <div className="font-culinary-sans text-body-md text-culinary-text-muted">
                    {formatDateTime(booking.createdAt)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-gutter py-4 font-culinary-sans text-body-md">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="inline-flex items-center rounded-none border border-culinary-navy bg-culinary-navy px-3 py-1 font-culinary-sans text-label-caps text-culinary-on-navy transition refined hover:bg-culinary-navy/90"
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
