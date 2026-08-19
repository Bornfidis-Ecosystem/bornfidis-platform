'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { importAdminInvoicesFromStripeAction } from './actions'

type Props = {
  division: 'provisions' | 'digital-studio'
  mode: string
}

export function InvoiceSyncFromStripeButton({ division, mode }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const label = division === 'digital-studio' ? 'Digital Studio' : 'Provisions'

  const handleSync = () => {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await importAdminInvoicesFromStripeAction(division)
      if (!result.success) {
        setError(result.error || 'Sync failed')
        return
      }
      setMessage(
        `${label} (${result.mode || mode}): scanned ${result.scanned ?? 0}, imported ${result.imported ?? 0}, updated ${result.updated ?? 0}`,
      )
      router.refresh()
    })
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className="rounded-none border border-culinary-outline bg-white px-3 py-1.5 font-culinary-sans text-xs font-semibold text-culinary-navy disabled:opacity-50"
      >
        {isPending ? `Syncing ${label}…` : `Sync ${label} from Stripe (${mode})`}
      </button>
      {message ? <p className="font-culinary-sans text-xs text-green-800">{message}</p> : null}
      {error ? <p className="font-culinary-sans text-xs text-red-700">{error}</p> : null}
    </div>
  )
}
