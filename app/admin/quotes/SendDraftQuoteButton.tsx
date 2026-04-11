'use client'

import { useState } from 'react'
import { toast as uiToast } from '@/components/ui/Toast'

export function SendDraftQuoteButton({
  quoteId,
  disabled,
  onSuccess,
  className,
}: {
  quoteId: string
  disabled?: boolean
  /** When set, called instead of a full page reload after a successful send. */
  onSuccess?: () => void
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  async function send() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/send`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.message || `Send failed (${res.status})`)
      }
      uiToast.success('Quote sent')
      if (onSuccess) onSuccess()
      else window.location.reload()
    } catch (e) {
      uiToast.error(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={send}
      className={
        className ??
        'rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-50'
      }
    >
      {loading ? 'Sending…' : 'Send'}
    </button>
  )
}
