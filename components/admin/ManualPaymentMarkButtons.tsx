'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { markBalancePaidManually, markDepositPaidManually } from '@/app/admin/bookings/actions'

type Props = {
  bookingId: string
  depositPaid: boolean
  balancePaid: boolean
}

export default function ManualPaymentMarkButtons({ bookingId, depositPaid, balancePaid }: Props) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()

  function run(action: 'deposit' | 'balance') {
    const label = action === 'deposit' ? 'mark deposit as paid' : 'mark balance as paid'
    if (!window.confirm(`Admin only: ${label} manually? This logs an activity on the booking.`)) {
      return
    }
    startTransition(async () => {
      const res =
        action === 'deposit'
          ? await markDepositPaidManually(bookingId, note.trim() || undefined)
          : await markBalancePaidManually(bookingId, note.trim() || undefined)
      if (res.success) {
        if (res.alreadyApplied) {
          toast.success('Already recorded — no change.')
        } else {
          toast.success(action === 'deposit' ? 'Deposit marked paid.' : 'Balance marked paid.')
        }
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'Failed')
      }
    })
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Optional note</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (logged on activity)"
          rows={2}
          disabled={pending}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/30"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || depositPaid}
          onClick={() => run('deposit')}
          className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {depositPaid ? 'Deposit already recorded' : 'Mark deposit paid (manual)'}
        </button>
        <button
          type="button"
          disabled={pending || balancePaid}
          onClick={() => run('balance')}
          className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {balancePaid ? 'Balance already recorded' : 'Mark balance paid (manual)'}
        </button>
      </div>
    </div>
  )
}
