import type { BookingInquiry } from '@/types/booking'
import type { LastStripeActivityInfo } from '@/lib/admin-payment-health'
import { formatUSD } from '@/lib/money'
import ManualPaymentMarkButtons from './ManualPaymentMarkButtons'
import PaymentSummaryActionButtons from './PaymentSummaryActionButtons'

type Props = {
  booking: Pick<
    BookingInquiry,
    | 'id'
    | 'name'
    | 'paid_at'
    | 'balance_paid_at'
    | 'fully_paid_at'
    | 'stripe_payment_intent_id'
    | 'balance_payment_intent_id'
    | 'stripe_balance_payment_intent_id'
    | 'deposit_amount_cents'
    | 'balance_amount_cents'
    | 'quote_total_cents'
    | 'event_date'
    | 'email'
    | 'phone'
  >
  lastStripeActivity: LastStripeActivityInfo
  /** Quote saved with line items (required for deposit/quote emails). */
  hasSavedQuote: boolean
}

function fmtDate(iso: string | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

/**
 * Payment truth-at-a-glance for admin booking detail (pairs with Stripe webhook updates).
 */
export default function BookingPaymentSummaryCard({ booking, lastStripeActivity, hasSavedQuote }: Props) {
  const depositPaid = !!booking.paid_at
  const balancePaid = !!(booking.balance_paid_at || booking.fully_paid_at)

  const quoteTotal = booking.quote_total_cents ?? 0
  const depositCents = booking.deposit_amount_cents ?? 0
  const storedBalance = booking.balance_amount_cents ?? 0
  const impliedBalance =
    storedBalance > 0 ? storedBalance : Math.max(quoteTotal - depositCents, 0)
  const hasBalanceDue = !balancePaid && impliedBalance > 0

  let paymentBadge: { label: string; className: string }
  if (balancePaid) {
    paymentBadge = {
      label: 'Fully paid',
      className: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    }
  } else if (depositPaid && impliedBalance > 0) {
    paymentBadge = {
      label: 'Partially paid',
      className: 'bg-amber-50 text-amber-900 border border-amber-200',
    }
  } else if (depositPaid) {
    paymentBadge = {
      label: 'Deposit only',
      className: 'bg-sky-50 text-sky-900 border border-sky-200',
    }
  } else {
    paymentBadge = {
      label: 'No payment recorded',
      className: 'bg-stone-100 text-stone-700 border border-stone-200',
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1A3C34] uppercase tracking-[0.15em]">Payment</h2>
          <p className="text-xs text-stone-500 mt-0.5">Stripe + manual reconciliation</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.className}`}
        >
          {paymentBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-stone-100 bg-stone-50/80 p-3">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Deposit</p>
          <p className="mt-1 font-semibold text-[#1A3C34]">
            {depositPaid ? 'Paid' : 'Pending'}
            {depositCents > 0 && (
              <span className="ml-2 font-normal text-stone-600">
                ({formatUSD(depositCents)})
              </span>
            )}
          </p>
          <p className="text-xs text-stone-600 mt-1 tabular-nums">{fmtDate(booking.paid_at)}</p>
        </div>
        <div className="rounded-lg border border-stone-100 bg-stone-50/80 p-3">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Full balance</p>
          <p className="mt-1 font-semibold text-[#1A3C34]">
            {balancePaid ? 'Paid' : 'Pending'}
            {!balancePaid && impliedBalance > 0 && (
              <span className="ml-2 font-normal text-stone-600">
                ({formatUSD(impliedBalance)} due)
              </span>
            )}
          </p>
          <p className="text-xs text-stone-600 mt-1 tabular-nums">
            {fmtDate(booking.balance_paid_at || booking.fully_paid_at)}
          </p>
        </div>
      </div>

      <PaymentSummaryActionButtons
        bookingId={booking.id}
        clientName={booking.name}
        eventDate={booking.event_date}
        email={booking.email}
        phone={booking.phone}
        hasSavedQuote={hasSavedQuote}
        depositPaid={depositPaid}
        balancePaid={balancePaid}
        hasBalanceDue={hasBalanceDue}
      />

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-stone-500 shrink-0">Deposit PI</span>
          <code className="text-stone-800 break-all text-[11px]">
            {booking.stripe_payment_intent_id || '—'}
          </code>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-stone-500 shrink-0">Balance PI</span>
          <code className="text-stone-800 break-all text-[11px]">
            {booking.balance_payment_intent_id || booking.stripe_balance_payment_intent_id || '—'}
          </code>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-stone-500 shrink-0">Last Stripe-linked activity</span>
          <span className="text-stone-700">
            {lastStripeActivity ? (
              <>
                <span className="font-mono text-[11px]">{lastStripeActivity.stripeEventId}</span>
                <span className="text-stone-400 mx-1">·</span>
                {fmtDate(lastStripeActivity.createdAt)}
              </>
            ) : (
              '—'
            )}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-stone-200">
        <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-2">
          Manual reconciliation
        </p>
        <ManualPaymentMarkButtons
          bookingId={booking.id}
          depositPaid={depositPaid}
          balancePaid={balancePaid}
        />
      </div>
    </div>
  )
}
