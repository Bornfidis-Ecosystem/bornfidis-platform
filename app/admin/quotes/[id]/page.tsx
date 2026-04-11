import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminUser } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/formatCurrency'
import { dollarsToCents } from '@/lib/money'

function toNum(d: unknown): number {
  if (d == null) return 0
  if (typeof d === 'object' && d !== null && 'toNumber' in d) {
    return (d as { toNumber: () => number }).toNumber()
  }
  return Number(d)
}

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const metadata = { title: 'Quote detail — Bornfidis Admin' }

export default async function AdminQuoteDetailPage({ params }: { params: { id: string } }) {
  await requireAdminUser()

  const quote = await db.quotes.findUnique({
    where: { id: params.id },
    include: {
      bookings: true,
      booking_items: { orderBy: { created_at: 'asc' } },
    },
  })

  if (!quote) notFound()

  const totalCents = dollarsToCents(toNum(quote.total_usd))
  const depositCents = dollarsToCents(toNum(quote.deposit_amount_usd))
  const status = (quote.quote_status || 'draft').toLowerCase()

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/admin/quotes"
        className="mb-6 inline-block text-sm font-medium text-green-800 hover:underline"
      >
        ← Event quotes
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Quote</p>
            <h1 className="text-xl font-medium text-gray-900">
              {quote.quote_number?.trim() || quote.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{quote.service_type}</p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
              status === 'sent'
                ? 'bg-blue-50 text-blue-800'
                : status === 'draft'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {quote.quote_status || 'draft'}
          </span>
        </div>

        {quote.bookings && (
          <section className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Client & event</p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-gray-900">{quote.bookings.customer_name}</p>
              <p className="text-gray-600">{quote.bookings.customer_email ?? '—'}</p>
              <p className="text-gray-600">
                {fmtDate(quote.bookings.event_date)} · {quote.bookings.guest_count ?? '—'} guests ·{' '}
                {quote.bookings.location}
              </p>
            </div>
            <Link
              href={`/admin/bookings/${quote.bookings.id}`}
              className="mt-3 inline-block text-sm font-medium text-green-800 hover:underline"
            >
              Open booking
            </Link>
          </section>
        )}

        <section className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Totals</p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-gray-500">Total</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalCents)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-gray-500">
                Deposit ({quote.deposit_percentage ?? 50}%)
              </span>
              <span className="font-medium text-green-800">{formatCurrency(depositCents)}</span>
            </div>
          </div>
        </section>

        {quote.booking_items.length > 0 && (
          <section className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Line items</p>
            <ul className="mt-2 divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {quote.booking_items.map((item) => (
                <li key={item.id} className="flex flex-col gap-0.5 px-3 py-2 text-sm sm:flex-row sm:justify-between">
                  <span className="text-gray-900">
                    {item.item_name}
                    {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                  </span>
                  <span className="tabular-nums text-gray-600">
                    {formatCurrency(dollarsToCents(toNum(item.total_price_usd)))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {quote.notes && (
          <section className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{quote.notes}</p>
          </section>
        )}
      </div>
    </div>
  )
}
