import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminUser } from '@/lib/requireAdmin'
import { CulinaryCard } from '@/components/culinary-os'
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

  const statusChip =
    status === 'sent'
      ? 'border border-blue-200/80 bg-blue-50/90 text-blue-900'
      : status === 'draft'
        ? 'border border-amber-200/80 bg-amber-50/90 text-amber-900'
        : 'border border-culinary-outline bg-culinary-surface-high text-culinary-text-muted'

  return (
    <div className="mx-auto max-w-3xl px-gutter py-stack-md">
      <Link
        href="/admin/quotes"
        className="mb-6 inline-block font-culinary-sans text-sm font-medium text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
      >
        ← Event quotes
      </Link>

      <CulinaryCard>
        <div className="flex flex-col gap-2 border-b border-culinary-outline pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Quote</p>
            <h1 className="font-culinary-display text-xl font-medium text-culinary-ink">
              {quote.quote_number?.trim() || quote.id.slice(0, 8)}
            </h1>
            <p className="mt-1 font-culinary-sans text-sm text-culinary-text-muted">{quote.service_type}</p>
          </div>
          <span className={`inline-flex w-fit rounded-none px-2.5 py-1 font-culinary-sans text-xs font-medium ${statusChip}`}>
            {quote.quote_status || 'draft'}
          </span>
        </div>

        {quote.bookings && (
          <section className="mt-6">
            <p className="font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Client & event</p>
            <div className="mt-2 space-y-1 font-culinary-sans text-sm">
              <p className="text-culinary-ink">{quote.bookings.customer_name}</p>
              <p className="text-culinary-text-muted">{quote.bookings.customer_email ?? '—'}</p>
              <p className="text-culinary-text-muted">
                {fmtDate(quote.bookings.event_date)} · {quote.bookings.guest_count ?? '—'} guests · {quote.bookings.location}
              </p>
            </div>
            <Link
              href={`/admin/bookings/${quote.bookings.id}`}
              className="mt-3 inline-block font-culinary-sans text-sm font-medium text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
            >
              Open booking
            </Link>
          </section>
        )}

        <section className="mt-6">
          <p className="font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Totals</p>
          <div className="mt-2 grid gap-2 font-culinary-sans text-sm sm:grid-cols-2">
            <div className="flex justify-between rounded-none border border-culinary-outline bg-culinary-surface-low px-3 py-2">
              <span className="text-culinary-text-muted">Total</span>
              <span className="font-medium text-culinary-ink">{formatCurrency(totalCents)}</span>
            </div>
            <div className="flex justify-between rounded-none border border-culinary-outline bg-culinary-surface-low px-3 py-2">
              <span className="text-culinary-text-muted">Deposit ({quote.deposit_percentage ?? 50}%)</span>
              <span className="font-medium text-culinary-forest">{formatCurrency(depositCents)}</span>
            </div>
          </div>
        </section>

        {quote.booking_items.length > 0 && (
          <section className="mt-6">
            <p className="font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Line items</p>
            <ul className="mt-2 divide-y divide-culinary-outline rounded-none border border-culinary-outline">
              {quote.booking_items.map((item) => (
                <li key={item.id} className="flex flex-col gap-0.5 px-3 py-2 font-culinary-sans text-sm sm:flex-row sm:justify-between">
                  <span className="text-culinary-ink">
                    {item.item_name}
                    {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                  </span>
                  <span className="tabular-nums text-culinary-text-muted">
                    {formatCurrency(dollarsToCents(toNum(item.total_price_usd)))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {quote.notes && (
          <section className="mt-6">
            <p className="font-culinary-sans text-xs font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Notes</p>
            <p className="mt-2 whitespace-pre-wrap font-culinary-sans text-sm text-culinary-text-muted">{quote.notes}</p>
          </section>
        )}
      </CulinaryCard>
    </div>
  )
}
