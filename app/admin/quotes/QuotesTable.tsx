'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { SendDraftQuoteButton } from './SendDraftQuoteButton'

interface QuoteRow {
  id: string
  quote_number: string | null
  created_at: string | null
  quote_status: string | null
  service_type: string
  total_usd: number
  deposit_amount_usd: number
  deposit_percentage: number | null
  sent_date: string | null
  accepted_date: string | null
  expires_date: string | null
  notes: string | null
  version: number | null
  item_count: number
  confidence: 'high' | 'medium' | 'low' | null
  confidence_reason: string | null
  booking: {
    id: string
    customer_name: string | null
    customer_email: string | null
    event_date: string | null
    service_type: string | null
    guest_count: number | null
    location: string | null
  } | null
}

interface Pagination {
  total: number
  page: number
  per_page: number
  total_pages: number
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const fmtDateTime = (s: string | null) =>
  s
    ? new Date(s).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-50 text-blue-700',
    accepted: 'bg-green-50 text-green-700',
    expired: 'bg-red-50 text-red-600',
    declined: 'bg-orange-50 text-orange-700',
  }
  const cls = map[status ?? ''] ?? 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status ?? 'unknown'}
    </span>
  )
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' | null }) {
  if (!level) return null
  const map = {
    high: { cls: 'bg-green-50 text-green-700', label: 'High' },
    medium: { cls: 'bg-amber-50 text-amber-700', label: 'Medium' },
    low: { cls: 'bg-red-50 text-red-600', label: 'Low' },
  }
  const { cls, label } = map[level]
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function draftSendAllowed(q: QuoteRow): boolean {
  const status = (q.quote_status || 'draft').toLowerCase()
  if (status !== 'draft') return false
  if (!q.quote_number?.trim()) return false
  return Boolean(q.booking?.customer_email?.includes('@'))
}

function QuoteDrawer({
  quote,
  onClose,
  onSent,
}: {
  quote: QuoteRow
  onClose: () => void
  onSent: () => void
}) {
  const canSend = draftSendAllowed(quote)
  const status = (quote.quote_status || 'draft').toLowerCase()
  const isDraft = status === 'draft'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-gray-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Quote detail</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{quote.service_type}</p>
            {quote.quote_number?.trim() && (
              <p className="mt-1 font-mono text-xs text-gray-500">{quote.quote_number}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={quote.quote_status} />
            {quote.confidence && <ConfidenceBadge level={quote.confidence} />}
            {quote.confidence_reason && (
              <p className="mt-1 w-full text-xs text-gray-400">{quote.confidence_reason}</p>
            )}
          </div>

          {quote.booking && (
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Client</p>
              <div className="space-y-1.5">
                <p className="text-sm text-gray-900">{quote.booking.customer_name ?? '—'}</p>
                <p className="text-sm text-gray-500">{quote.booking.customer_email ?? '—'}</p>
                {quote.booking.location && <p className="text-sm text-gray-500">{quote.booking.location}</p>}
              </div>
            </section>
          )}

          {quote.booking && (
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Event</p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Date</span>
                <span className="text-right text-gray-900">{fmtDate(quote.booking.event_date)}</span>
                <span className="text-gray-500">Guests</span>
                <span className="text-right text-gray-900">{quote.booking.guest_count ?? '—'}</span>
                <span className="text-gray-500">Type</span>
                <span className="text-right text-gray-900">{quote.booking.service_type ?? '—'}</span>
              </div>
            </section>
          )}

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Financials</p>
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-medium text-gray-900">{usd(quote.total_usd)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deposit ({quote.deposit_percentage ?? 50}%)</span>
                <span className="font-medium text-green-700">{usd(quote.deposit_amount_usd)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Line items</span>
                <span className="text-gray-900">{quote.item_count}</span>
              </div>
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Timeline</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-500">Created</span>
              <span className="text-right text-gray-900">{fmtDateTime(quote.created_at)}</span>
              <span className="text-gray-500">Sent</span>
              <span className="text-right text-gray-900">{fmtDate(quote.sent_date)}</span>
              <span className="text-gray-500">Expires</span>
              <span
                className={`text-right font-medium ${
                  quote.expires_date && new Date(quote.expires_date) < new Date()
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}
              >
                {fmtDate(quote.expires_date)}
              </span>
              <span className="text-gray-500">Accepted</span>
              <span className="text-right text-gray-900">{fmtDate(quote.accepted_date)}</span>
            </div>
          </section>

          {quote.notes && (
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Notes</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{quote.notes}</p>
            </section>
          )}

          <section className="space-y-2 border-t border-gray-100 pt-2">
            {isDraft && (
              <div className="space-y-2">
                <SendDraftQuoteButton
                  quoteId={quote.id}
                  disabled={!canSend}
                  onSuccess={onSent}
                  className="block w-full rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
                />
                {!canSend && (
                  <p className="text-center text-xs text-amber-600">
                    {!quote.quote_number?.trim()
                      ? 'Quote reference missing — cannot send.'
                      : !quote.booking?.customer_email?.includes('@')
                        ? 'Add a valid email on the booking before sending.'
                        : ''}
                  </p>
                )}
              </div>
            )}
            {quote.booking && (
              <Link
                href={`/admin/bookings/${quote.booking.id}`}
                className="block w-full rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-green-800"
              >
                View booking
              </Link>
            )}
            <Link
              href={`/admin/quotes/${quote.id}`}
              className="block w-full rounded-lg bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Full quote detail
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

export function QuotesTable() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const [selected, setSelected] = useState<QuoteRow | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedSearch])

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '25' })
      if (statusFilter) params.set('status', statusFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/admin/quotes?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setQuotes(data.quotes)
      setPagination(data.pagination)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const needsAttention = quotes.filter((q) => q.confidence === 'low' || q.confidence === 'medium').length

  const expiringSoon = quotes.filter((q) => {
    if (!q.expires_date || q.quote_status === 'accepted') return false
    const days = (new Date(q.expires_date).getTime() - Date.now()) / 86400000
    return days >= 0 && days <= 3
  }).length

  const handleSent = useCallback(() => {
    void fetchQuotes()
    setSelected(null)
  }, [fetchQuotes])

  return (
    <>
      {(needsAttention > 0 || expiringSoon > 0) && (
        <div className="mb-5 flex flex-wrap gap-3">
          {needsAttention > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1L13 13H1L7 1Z"
                  stroke="#b45309"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path d="M7 5.5V8" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.6" fill="#b45309" />
              </svg>
              <span className="text-xs font-medium text-amber-700">
                {needsAttention} quote{needsAttention > 1 ? 's' : ''} need review
              </span>
            </div>
          )}
          {expiringSoon > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#dc2626" strokeWidth="1.2" fill="none" />
                <path
                  d="M7 4v3.5l2 1.5"
                  stroke="#dc2626"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-medium text-red-700">
                {expiringSoon} expiring within 3 days
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by client name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="declined">Declined</option>
        </select>
        {pagination && (
          <span className="ml-auto text-xs text-gray-400">
            {pagination.total} quote{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Confidence
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  <p>No quotes found</p>
                  <Link
                    href="/admin/quotes/builder"
                    className="mt-3 inline-block text-sm font-medium text-green-800 underline"
                  >
                    Open manual quote builder
                  </Link>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              quotes.map((q) => {
                const isExpired =
                  q.expires_date &&
                  new Date(q.expires_date) < new Date() &&
                  q.quote_status !== 'accepted'

                const rowExpiringSoon =
                  q.expires_date &&
                  !isExpired &&
                  q.quote_status === 'sent' &&
                  (new Date(q.expires_date).getTime() - Date.now()) / 86400000 <= 3

                return (
                  <tr
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3.5">
                      <p className="max-w-[160px] truncate font-medium text-gray-900">
                        {q.booking?.customer_name ?? '—'}
                      </p>
                      <p className="max-w-[160px] truncate text-xs text-gray-400">
                        {q.booking?.customer_email ?? ''}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="max-w-[180px] truncate text-gray-900">{q.service_type}</p>
                      <p className="text-xs text-gray-400">
                        {fmtDate(q.booking?.event_date ?? null)}
                        {q.booking?.guest_count ? ` · ${q.booking.guest_count} guests` : ''}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={q.quote_status} />
                      {rowExpiringSoon && (
                        <p className="mt-1 text-xs text-red-500">Expires {fmtDate(q.expires_date)}</p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <ConfidenceBadge level={q.confidence} />
                      {q.confidence === null && <span className="text-xs text-gray-300">—</span>}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <p className="font-medium text-gray-900">{usd(q.total_usd)}</p>
                      <p className="text-xs text-gray-400">{q.item_count} items</p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs text-gray-400">
                      {fmtDateTime(q.created_at)}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {pagination.page} of {pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selected && (
        <QuoteDrawer quote={selected} onClose={() => setSelected(null)} onSent={handleSent} />
      )}
    </>
  )
}
