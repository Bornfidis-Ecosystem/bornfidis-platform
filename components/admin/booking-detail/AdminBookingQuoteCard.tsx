import BookingPaymentSummaryCard from '@/components/admin/BookingPaymentSummaryCard'
import type { BookingInquiry } from '@/types/booking'
import type { LastStripeActivityInfo } from '@/lib/admin-payment-health'

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
  hasSavedQuote: boolean
  showFounderOnlyPaymentControls?: boolean
}

/** Wireframe “Quote & payment” snapshot — heading + existing payment summary card. */
export function AdminBookingQuoteCard(props: Props) {
  return (
    <section className="space-y-2">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy">Quote &amp; payment</h2>
        <p className="mt-0.5 text-xs text-gray-500">Deposit / balance status and Stripe activity</p>
      </header>
      <BookingPaymentSummaryCard {...props} />
    </section>
  )
}
