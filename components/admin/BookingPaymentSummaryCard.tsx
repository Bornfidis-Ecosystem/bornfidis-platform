import type { BookingInquiry } from '@/types/booking'
import type { LastStripeActivityInfo } from '@/lib/admin-payment-health'
import { formatUSD } from '@/lib/money'
import ManualPaymentMarkButtons from './ManualPaymentMarkButtons'
import PaymentSummaryActionButtons from './PaymentSummaryActionButtons'
import { CulinaryCard } from '@/components/culinary-os'

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
  /** Manual mark-paid / dangerous reconciliation — founder_admin only. */
  showFounderOnlyPaymentControls?: boolean
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
export default function BookingPaymentSummaryCard({
  booking,
  lastStripeActivity,
  hasSavedQuote,
  showFounderOnlyPaymentControls = false,
}: Props) {
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
      className: 'border-culinary-forest/50 bg-culinary-bone text-culinary-forest',
    }
  } else if (depositPaid && impliedBalance > 0) {
    paymentBadge = {
      label: 'Partially paid',
      className: 'border-culinary-gold-line bg-culinary-bone text-culinary-navy',
    }
  } else if (depositPaid) {
    paymentBadge = {
      label: 'Deposit only',
      className: 'border-culinary-outline bg-culinary-surface-low text-culinary-navy',
    }
  } else {
    paymentBadge = {
      label: 'No payment recorded',
      className: 'border-culinary-outline bg-culinary-surface-low text-culinary-text-muted',
    }
  }

  const miniPanel =
    'rounded-none border border-culinary-outline bg-culinary-surface-low p-gutter'

  return (
    <CulinaryCard>
      <div className="mb-stack-md flex flex-wrap items-start justify-between gap-stack-sm">
        <div>
          <h2 className="font-culinary-sans text-label-caps text-culinary-navy">Payment</h2>
          <p className="mt-0.5 font-culinary-sans text-body-md text-culinary-text-muted">
            Stripe + manual reconciliation
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-none border px-3 py-1 font-culinary-sans text-label-caps ${paymentBadge.className}`}
        >
          {paymentBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-gutter text-body-md sm:grid-cols-2">
        <div className={miniPanel}>
          <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Deposit</p>
          <p className="mt-1 font-culinary-sans text-body-lg font-semibold text-culinary-ink">
            {depositPaid ? 'Paid' : 'Pending'}
            {depositCents > 0 && (
              <span className="ml-2 font-normal text-culinary-text-muted">({formatUSD(depositCents)})</span>
            )}
          </p>
          <p className="mt-1 font-culinary-sans text-body-md tabular-nums text-culinary-text-muted">
            {fmtDate(booking.paid_at)}
          </p>
        </div>
        <div className={miniPanel}>
          <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Full balance</p>
          <p className="mt-1 font-culinary-sans text-body-lg font-semibold text-culinary-ink">
            {balancePaid ? 'Paid' : 'Pending'}
            {!balancePaid && impliedBalance > 0 && (
              <span className="ml-2 font-normal text-culinary-text-muted">({formatUSD(impliedBalance)} due)</span>
            )}
          </p>
          <p className="mt-1 font-culinary-sans text-body-md tabular-nums text-culinary-text-muted">
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

      <div className="mt-stack-md space-y-stack-sm font-culinary-sans text-body-md">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="shrink-0 text-culinary-text-muted">Deposit PI</span>
          <code className="break-all text-[11px] text-culinary-ink">{booking.stripe_payment_intent_id || '—'}</code>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="shrink-0 text-culinary-text-muted">Balance PI</span>
          <code className="break-all text-[11px] text-culinary-ink">
            {booking.balance_payment_intent_id || booking.stripe_balance_payment_intent_id || '—'}
          </code>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="shrink-0 text-culinary-text-muted">Last Stripe-linked activity</span>
          <span className="text-culinary-ink">
            {lastStripeActivity ? (
              <>
                <span className="font-mono text-[11px]">{lastStripeActivity.stripeEventId}</span>
                <span className="mx-1 text-culinary-outline-variant">·</span>
                {fmtDate(lastStripeActivity.createdAt)}
              </>
            ) : (
              '—'
            )}
          </span>
        </div>
      </div>

      {showFounderOnlyPaymentControls ? (
        <div className="mt-stack-md border-t border-culinary-outline pt-stack-md">
          <p className="mb-stack-sm font-culinary-sans text-label-caps text-culinary-text-muted">
            Manual reconciliation
          </p>
          <ManualPaymentMarkButtons
            bookingId={booking.id}
            depositPaid={depositPaid}
            balancePaid={balancePaid}
          />
        </div>
      ) : (
        <p className="mt-stack-md border-t border-culinary-outline pt-stack-md font-culinary-sans text-body-md text-culinary-text-muted">
          Manual payment overrides are limited to founder admins.
        </p>
      )}
    </CulinaryCard>
  )
}
