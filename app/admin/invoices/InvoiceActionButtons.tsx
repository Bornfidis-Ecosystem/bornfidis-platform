'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { resendAdminInvoice, voidAdminInvoice } from './actions'

type Props = {
  id: string
  status: string
}

export function InvoiceActionButtons({ id, status }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const disabled = status === 'paid' || status === 'void'

  const handleResend = () => {
    setError(null)
    startTransition(async () => {
      const result = await resendAdminInvoice(id)
      if (!result.success) {
        setError(result.error || 'Failed to resend invoice.')
        return
      }
      router.refresh()
    })
  }

  const handleVoid = () => {
    if (!window.confirm('Void this invoice in Stripe? This cannot be undone.')) return
    setError(null)
    startTransition(async () => {
      const result = await voidAdminInvoice(id)
      if (!result.success) {
        setError(result.error || 'Failed to void invoice.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={disabled || isPending}
          className="rounded-none border border-culinary-outline bg-white px-3 py-1.5 font-culinary-sans text-xs font-semibold text-culinary-navy disabled:opacity-50"
        >
          Resend Email
        </button>
        <button
          type="button"
          onClick={handleVoid}
          disabled={disabled || isPending}
          className="rounded-none border border-red-300 bg-red-50 px-3 py-1.5 font-culinary-sans text-xs font-semibold text-red-700 disabled:opacity-50"
        >
          Void
        </button>
      </div>
      {error ? <p className="font-culinary-sans text-xs text-red-700">{error}</p> : null}
    </div>
  )
}
