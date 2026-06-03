import BookingPaymentSummaryCard from '@/components/admin/BookingPaymentSummaryCard'
import type { BookingInquiry } from '@/types/booking'
import type { LastStripeActivityInfo } from '@/lib/admin-payment-health'
import { CulinarySection } from '@/components/culinary-os'

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

/** Quote & payment snapshot — heading + existing payment summary card. */
export function AdminBookingQuoteCard(props: Props) {
  return (
    <CulinarySection eyebrow="Quote & payment" spacing="sm">
      <p className="font-culinary-sans text-body-md text-culinary-text-muted">
        Deposit / balance status and Stripe activity
      </p>
      <BookingPaymentSummaryCard {...props} />
    </CulinarySection>
  )
}
