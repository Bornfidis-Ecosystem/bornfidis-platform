'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { markBalancePaidManually, markDepositPaidManually } from '@/app/admin/bookings/actions'
import { linkStripePaymentToBooking } from '@/app/admin/bookings/link-stripe-payment'
import { createStripeDepositLink } from '@/app/admin/bookings/quote-actions'
import { resendBalanceLink } from '@/app/admin/bookings/actions'

type Props = {
  bookingId: string
  depositPaid: boolean
  balancePaid: boolean
  hasBalanceDue: boolean
  showFounderControls: boolean
}

const btn =
  'inline-flex items-center justify-center rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:bg-culinary-surface-high disabled:cursor-not-allowed disabled:opacity-50'

const btnPrimary =
  'inline-flex items-center justify-center rounded-none border border-culinary-navy bg-culinary-navy px-3 py-2 font-culinary-sans text-label-caps text-culinary-on-navy transition refined hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

export default function LinkStripePaymentPanel({
  bookingId,
  depositPaid,
  balancePaid,
  hasBalanceDue,
  showFounderControls,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [pi, setPi] = useState('')
  const [note, setNote] = useState('')
  const [paymentType, setPaymentType] = useState<'deposit' | 'balance'>('deposit')

  function generateDepositLink() {
    startTransition(async () => {
      const res = await createStripeDepositLink(bookingId)
      if (res.success && res.url) {
        toast.success('Deposit Checkout link created (metadata attached)')
        window.open(res.url, '_blank', 'noopener,noreferrer')
        router.refresh()
      } else {
        toast.error(res.error || 'Could not create deposit link')
      }
    })
  }

  function generateBalanceLink() {
    startTransition(async () => {
      const res = await resendBalanceLink(bookingId)
      if (res.success && res.url) {
        toast.success('Balance Checkout link created')
        window.open(res.url, '_blank', 'noopener,noreferrer')
        router.refresh()
      } else {
        toast.error(res.error || 'Could not create balance link')
      }
    })
  }

  function linkPayment() {
    const id = pi.trim()
    if (!id.startsWith('pi_')) {
      toast.error('Enter a PaymentIntent id starting with pi_')
      return
    }
    if (
      !window.confirm(
        `Link ${id} as ${paymentType} on this booking? This updates payment status and writes an audit log.`,
      )
    ) {
      return
    }
    startTransition(async () => {
      const res = await linkStripePaymentToBooking({
        bookingId,
        paymentIntentId: id,
        paymentType,
        note: note.trim() || undefined,
      })
      if (res.success) {
        toast.success('Stripe payment linked')
        setPi('')
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error || 'Link failed')
      }
    })
  }

  function markManual(action: 'deposit' | 'balance') {
    if (!window.confirm(`Mark ${action} paid manually?`)) return
    startTransition(async () => {
      const res =
        action === 'deposit'
          ? await markDepositPaidManually(bookingId, note.trim() || undefined, pi.trim() || undefined)
          : await markBalancePaidManually(bookingId, note.trim() || undefined)
      if (res.success) {
        toast.success(res.alreadyApplied ? 'Already recorded' : `${action} marked paid`)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed')
      }
    })
  }

  return (
    <div className="mt-stack-md space-y-stack-md border-t border-culinary-outline pt-stack-md">
      <div>
        <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Generate Stripe Checkout links</p>
        <p className="mt-1 font-culinary-sans text-body-md text-culinary-text-muted">
          Prefer these over Dashboard Payment Links — they always include booking metadata for auto-match.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || depositPaid}
            onClick={generateDepositLink}
            className={btnPrimary}
          >
            Generate deposit link
          </button>
          <button
            type="button"
            disabled={pending || balancePaid || !hasBalanceDue}
            onClick={generateBalanceLink}
            className={btn}
          >
            Generate balance link
          </button>
        </div>
      </div>

      {showFounderControls && (
        <div className="space-y-stack-sm">
          <p className="font-culinary-sans text-label-caps text-culinary-text-muted">
            Link existing Stripe payment
          </p>
          <p className="font-culinary-sans text-body-md text-culinary-text-muted">
            For unmatched Dashboard Payment Links (paste PaymentIntent id, e.g. pi_3Ts…).
          </p>
          <input
            value={pi}
            onChange={(e) => setPi(e.target.value)}
            placeholder="pi_…"
            disabled={pending}
            className="w-full rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 font-mono text-sm text-culinary-ink focus:border-culinary-navy focus:outline-none"
          />
          <div className="flex flex-wrap gap-3 font-culinary-sans text-body-md">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="payType"
                checked={paymentType === 'deposit'}
                onChange={() => setPaymentType('deposit')}
              />
              Deposit
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="payType"
                checked={paymentType === 'balance'}
                onChange={() => setPaymentType('balance')}
              />
              Balance / paid in full
            </label>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
            rows={2}
            disabled={pending}
            className="w-full rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 font-culinary-sans text-body-md text-culinary-ink focus:border-culinary-navy focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={linkPayment} className={btnPrimary}>
              Link Stripe payment
            </button>
            <button
              type="button"
              disabled={pending || depositPaid}
              onClick={() => markManual('deposit')}
              className={btn}
            >
              Mark deposit paid (manual)
            </button>
            <button
              type="button"
              disabled={pending || balancePaid}
              onClick={() => markManual('balance')}
              className={btn}
            >
              Mark balance paid (manual)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
