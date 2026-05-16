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
    draft: 'border border-culinary-outline bg-culinary-surface-high text-culinary-text-muted',
    sent: 'border border-blue-200/80 bg-blue-50/90 text-blue-900',
    accepted: 'border border-culinary-forest/30 bg-culinary-surface-low text-culinary-forest',
    expired: 'border border-red-200/80 bg-red-50/90 text-red-800',
    declined: 'border border-amber-200/80 bg-amber-50/90 text-amber-900',
  }
  const cls = map[status ?? ''] ?? 'border border-culinary-outline bg-culinary-surface-high text-culinary-text-muted'
  return (
    <span className={`inline-flex items-center rounded-none border px-2 py-0.5 font-culinary-sans text-xs font-medium ${cls}`}>
      {status ?? 'unknown'}
    </span>
  )
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' | null }) {
  if (!level) return null
  const map = {
    high: { cls: 'border border-culinary-forest/30 bg-culinary-surface-low text-culinary-forest', label: 'High' },
    medium: { cls: 'border border-amber-200/80 bg-amber-50/90 text-amber-900', label: 'Medium' },
    low: { cls: 'border border-red-200/80 bg-red-50/90 text-red-800', label: 'Low' },
  }
  const { cls, label } = map[level]
  return (
    <span className={`inline-flex items-center rounded-none border px-2 py-0.5 font-culinary-sans text-xs font-medium ${cls}`}>
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
    <div className="fixed inset-0 z-50 flex justify-end bg-culinary-navy/20" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-culinary-outline bg-culinary-bone shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-culinary-outline bg-culinary-bone px-gutter py-4">
          <div>
            <p className="font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
              Quote detail
            </p>
            <p className="mt-0.5 font-culinary-sans text-sm font-medium text-culinary-ink">{quote.service_type}</p>
            {quote.quote_number?.trim() && (
              <p className="mt-1 font-mono text-xs text-culinary-text-muted">{quote.quote_number}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-none p-1 text-culinary-text-muted transition-colors hover:text-culinary-ink"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-gutter py-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={quote.quote_status} />
            {quote.confidence && <ConfidenceBadge level={quote.confidence} />}
            {quote.confidence_reason && (
              <p className="mt-1 w-full font-culinary-sans text-xs text-culinary-text-muted">{quote.confidence_reason}</p>
            )}
          </div>

          {quote.booking && (
            <section>
              <p className="mb-2 font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                Client
              </p>
              <div className="space-y-1.5 font-culinary-sans text-sm">
                <p className="text-culinary-ink">{quote.booking.customer_name ?? '—'}</p>
                <p className="text-culinary-text-muted">{quote.booking.customer_email ?? '—'}</p>
                {quote.booking.location && <p className="text-culinary-text-muted">{quote.booking.location}</p>}
              </div>
            </section>
          )}

          {quote.booking && (
            <section>
              <p className="mb-2 font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Event</p>
              <div className="grid grid-cols-2 gap-y-2 font-culinary-sans text-sm">
                <span className="text-culinary-text-muted">Date</span>
                <span className="text-right text-culinary-ink">{fmtDate(quote.booking.event_date)}</span>
                <span className="text-culinary-text-muted">Guests</span>
                <span className="text-right text-culinary-ink">{quote.booking.guest_count ?? '—'}</span>
                <span className="text-culinary-text-muted">Type</span>
                <span className="text-right text-culinary-ink">{quote.booking.service_type ?? '—'}</span>
              </div>
            </section>
          )}

          <section>
            <p className="mb-2 font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
              Financials
            </p>
            <div className="space-y-2 rounded-none border border-culinary-outline bg-culinary-surface-low p-4 font-culinary-sans text-sm">
              <div className="flex justify-between">
                <span className="text-culinary-text-muted">Total</span>
                <span className="font-medium text-culinary-ink">{usd(quote.total_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-culinary-text-muted">Deposit ({quote.deposit_percentage ?? 50}%)</span>
                <span className="font-medium text-culinary-forest">{usd(quote.deposit_amount_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-culinary-text-muted">Line items</span>
                <span className="text-culinary-ink">{quote.item_count}</span>
              </div>
            </div>
          </section>

          <section>
            <p className="mb-2 font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Timeline</p>
            <div className="grid grid-cols-2 gap-y-2 font-culinary-sans text-sm">
              <span className="text-culinary-text-muted">Created</span>
              <span className="text-right text-culinary-ink">{fmtDateTime(quote.created_at)}</span>
              <span className="text-culinary-text-muted">Sent</span>
              <span className="text-right text-culinary-ink">{fmtDate(quote.sent_date)}</span>
              <span className="text-culinary-text-muted">Expires</span>
              <span
                className={`text-right font-medium ${
                  quote.expires_date && new Date(quote.expires_date) < new Date() ? 'text-red-700' : 'text-culinary-ink'
                }`}
              >
                {fmtDate(quote.expires_date)}
              </span>
              <span className="text-culinary-text-muted">Accepted</span>
              <span className="text-right text-culinary-ink">{fmtDate(quote.accepted_date)}</span>
            </div>
          </section>

          {quote.notes && (
            <section>
              <p className="mb-2 font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Notes</p>
              <p className="whitespace-pre-wrap font-culinary-sans text-sm leading-relaxed text-culinary-text-muted">
                {quote.notes}
              </p>
            </section>
          )}

          <section className="space-y-2 border-t border-culinary-outline pt-2">
            {isDraft && (
              <div className="space-y-2">
                <SendDraftQuoteButton
                  quoteId={quote.id}
                  disabled={!canSend}
                  onSuccess={onSent}
                  className="block w-full rounded-none border border-culinary-navy bg-culinary-navy px-4 py-2.5 text-center font-culinary-sans text-sm font-medium text-culinary-on-navy transition-colors duration-refined ease-refined hover:opacity-90 disabled:opacity-50"
                />
                {!canSend && (
                  <p className="text-center font-culinary-sans text-xs text-amber-800">
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
                className="block w-full rounded-none border border-culinary-forest bg-culinary-forest px-4 py-2.5 text-center font-culinary-sans text-sm font-medium text-white transition-colors duration-refined ease-refined hover:opacity-90"
              >
                View booking
              </Link>
            )}
            <Link
              href={`/admin/quotes/${quote.id}`}
              className="block w-full rounded-none border border-culinary-outline bg-culinary-bone px-4 py-2.5 text-center font-culinary-sans text-sm font-medium text-culinary-navy transition-colors duration-refined ease-refined hover:border-culinary-gold-line hover:bg-culinary-surface-low"
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

  const inputBase =
    'rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 font-culinary-sans text-sm text-culinary-ink focus:border-culinary-navy focus:outline-none focus:ring-1 focus:ring-culinary-navy/30'

  return (
    <>
      {(needsAttention > 0 || expiringSoon > 0) && (
        <div className="mb-5 flex flex-wrap gap-3">
          {needsAttention > 0 && (
            <div className="flex items-center gap-2 rounded-none border border-amber-200/80 bg-amber-50/80 px-3 py-2">
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
              <span className="font-culinary-sans text-xs font-medium text-amber-900">
                {needsAttention} quote{needsAttention > 1 ? 's' : ''} need review
              </span>
            </div>
          )}
          {expiringSoon > 0 && (
            <div className="flex items-center gap-2 rounded-none border border-red-200/80 bg-red-50/80 px-3 py-2">
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
              <span className="font-culinary-sans text-xs font-medium text-red-800">{expiringSoon} expiring within 3 days</span>
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
          className={`w-56 ${inputBase}`}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputBase}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="declined">Declined</option>
        </select>
        {pagination && (
          <span className="ml-auto font-culinary-sans text-xs text-culinary-text-muted">
            {pagination.total} quote{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-none border border-culinary-outline bg-culinary-bone shadow-none">
        <table className="w-full border-collapse font-culinary-sans text-sm">
          <thead>
            <tr className="border-b border-culinary-outline bg-culinary-surface-low">
              <th className="px-gutter py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">
                Client
              </th>
              <th className="px-gutter py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">
                Event
              </th>
              <th className="px-gutter py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">
                Status
              </th>
              <th className="px-gutter py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">
                Confidence
              </th>
              <th className="px-gutter py-3 text-right text-xs font-medium uppercase tracking-wider text-culinary-text-muted">
                Total
              </th>
              <th className="px-gutter py-3 text-right text-xs font-medium uppercase tracking-wider text-culinary-text-muted">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-culinary-outline">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-gutter py-4">
                      <div className="h-3 w-[70%] animate-pulse rounded-none bg-culinary-surface-high" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-gutter py-10 text-center font-culinary-sans text-sm text-red-700">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-gutter py-10 text-center font-culinary-sans text-sm text-culinary-text-muted">
                  <p>No quotes found</p>
                  <Link
                    href="/admin/quotes/builder"
                    className="mt-3 inline-block font-medium text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
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
                    className="cursor-pointer border-b border-culinary-outline transition-colors duration-refined ease-refined hover:bg-culinary-surface-low"
                  >
                    <td className="px-gutter py-3.5">
                      <p className="max-w-[160px] truncate font-medium text-culinary-ink">{q.booking?.customer_name ?? '—'}</p>
                      <p className="max-w-[160px] truncate text-xs text-culinary-text-muted">{q.booking?.customer_email ?? ''}</p>
                    </td>

                    <td className="px-gutter py-3.5">
                      <p className="max-w-[180px] truncate text-culinary-ink">{q.service_type}</p>
                      <p className="text-xs text-culinary-text-muted">
                        {fmtDate(q.booking?.event_date ?? null)}
                        {q.booking?.guest_count ? ` · ${q.booking.guest_count} guests` : ''}
                      </p>
                    </td>

                    <td className="px-gutter py-3.5">
                      <StatusBadge status={q.quote_status} />
                      {rowExpiringSoon && (
                        <p className="mt-1 font-culinary-sans text-xs text-red-700">Expires {fmtDate(q.expires_date)}</p>
                      )}
                    </td>

                    <td className="px-gutter py-3.5">
                      <ConfidenceBadge level={q.confidence} />
                      {q.confidence === null && <span className="font-culinary-sans text-xs text-culinary-outline-variant">—</span>}
                    </td>

                    <td className="px-gutter py-3.5 text-right">
                      <p className="font-medium text-culinary-ink">{usd(q.total_usd)}</p>
                      <p className="text-xs text-culinary-text-muted">{q.item_count} items</p>
                    </td>

                    <td className="whitespace-nowrap px-gutter py-3.5 text-right text-xs text-culinary-text-muted">
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
          <p className="font-culinary-sans text-xs text-culinary-text-muted">
            Page {pagination.page} of {pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-none border border-culinary-outline bg-culinary-bone px-3 py-1.5 font-culinary-sans text-xs text-culinary-text-muted transition-colors duration-refined ease-refined hover:border-culinary-gold-line hover:bg-culinary-surface-low disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
              className="rounded-none border border-culinary-outline bg-culinary-bone px-3 py-1.5 font-culinary-sans text-xs text-culinary-text-muted transition-colors duration-refined ease-refined hover:border-culinary-gold-line hover:bg-culinary-surface-low disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selected && <QuoteDrawer quote={selected} onClose={() => setSelected(null)} onSent={handleSent} />}
    </>
  )
}
