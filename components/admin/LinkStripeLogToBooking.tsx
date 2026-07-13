'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { linkStripePaymentToBooking } from '@/app/admin/bookings/link-stripe-payment'

type Props = {
  webhookLogId: string
  paymentIntentId: string
  amountCents?: number | null
  customerEmail?: string | null
}

export default function LinkStripeLogToBooking({
  webhookLogId,
  paymentIntentId,
  amountCents,
  customerEmail,
}: Props) {
  const router = useRouter()
  const [bookingId, setBookingId] = useState('')
  const [pending, startTransition] = useTransition()

  function submit() {
    const id = bookingId.trim()
    if (!id) {
      toast.error('Paste booking UUID')
      return
    }
    startTransition(async () => {
      const res = await linkStripePaymentToBooking({
        bookingId: id,
        paymentIntentId,
        paymentType: 'deposit',
        webhookLogId,
        amountCents: amountCents ?? undefined,
        note: customerEmail ? `Matched from reconciliation tab (${customerEmail})` : undefined,
      })
      if (res.success) {
        toast.success('Linked as deposit')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed')
      }
    })
  }

  return (
    <div className="flex min-w-[10rem] flex-col gap-1">
      <input
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        placeholder="booking uuid"
        disabled={pending}
        className="rounded-none border border-culinary-outline bg-white px-2 py-1 font-mono text-[11px]"
      />
      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="rounded-none border border-culinary-navy bg-culinary-navy px-2 py-1 text-label-caps text-culinary-on-navy disabled:opacity-50"
      >
        Link deposit
      </button>
    </div>
  )
}
