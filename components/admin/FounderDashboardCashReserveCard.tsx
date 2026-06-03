'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FounderDashboardCashReserveCardProps {
  cashReserveCents: number
}

export function FounderDashboardCashReserveCard({ cashReserveCents }: FounderDashboardCashReserveCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cents = Math.round(parseFloat(input || '0') * 100)
    if (Number.isNaN(cents)) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/metrics/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashReserveCents: cents }),
      })
      if (res.ok) {
        setEditing(false)
        setInput('')
        router.refresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const displayValue = (cashReserveCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase">Cash Reserve</p>
      <div className="flex items-baseline gap-2 mt-1 flex-wrap">
        <span className="text-xl font-bold text-[#1A3C34]">${displayValue}</span>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 hover:text-[#1A3C34] underline"
          >
            Set
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="inline-flex items-center gap-1">
            <input
              type="number"
              step="0.01"
              min="0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="0.00"
              className="w-20 border border-gray-200 rounded px-2 py-1 text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting}
              className="text-xs text-[#1A3C34] font-medium disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setInput(''); }}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-0.5 break-words">Reserve (persistence later)</p>
    </div>
  )
}
