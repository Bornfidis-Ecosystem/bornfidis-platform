'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resendChefStatement } from '../actions'

type Props = { chefId: string }

export default function ResendStatementForm({ chefId }: Props) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<'success' | 'error' | null>(null)

  const now = new Date()
  const options: { year: number; month: number; label: string }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    })
  }

  const [selected, setSelected] = useState(`${options[0].year}-${String(options[0].month).padStart(2, '0')}`)

  async function handleResend() {
    const [year, month] = selected.split('-').map(Number)
    setSending(true)
    setMessage(null)
    const res = await resendChefStatement(chefId, year, month)
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
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Resend monthly statement (Phase 2T)</h3>
      <p className="text-xs text-gray-500 mb-2">
        Re-send the statement email with PDF for a past month. No edits; read-only.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          {options.map((o) => (
            <option key={`${o.year}-${o.month}`} value={`${o.year}-${String(o.month).padStart(2, '0')}`}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="rounded bg-[#1a5f3f] px-3 py-1.5 text-sm text-white hover:bg-[#154a32] disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Resend statement'}
        </button>
        {message === 'success' && <span className="text-sm text-green-600">Sent.</span>}
      </div>
    </div>
  )
}
