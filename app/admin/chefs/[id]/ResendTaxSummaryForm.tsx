'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resendChefTaxSummary } from '../actions'

type Props = { chefId: string }

export default function ResendTaxSummaryForm({ chefId }: Props) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<'success' | 'error' | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 1 - i) // prior year + 5 more

  const [selectedYear, setSelectedYear] = useState(currentYear - 1)

  async function handleResend() {
    setSending(true)
    setMessage(null)
    const res = await resendChefTaxSummary(chefId, selectedYear)
    setSending(false)
    if (res.success) {
      setMessage('success')
      router.refresh()
    } else {
      setMessage('error')
      alert(res.error ?? 'Failed to resend')
    }
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Resend annual tax summary (Phase 2AF)</h3>
      <p className="text-xs text-gray-500 mb-2">
        Re-send the tax summary email with PDF for a calendar year. Informational only; no edits after generation.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="rounded bg-[#1a5f3f] px-3 py-1.5 text-sm text-white hover:bg-[#154a32] disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Resend tax summary'}
        </button>
        {message === 'success' && <span className="text-sm text-green-600">Sent.</span>}
      </div>
    </div>
  )
}
