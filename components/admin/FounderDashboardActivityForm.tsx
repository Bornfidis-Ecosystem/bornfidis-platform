'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DIVISIONS = ['Sportswear', 'Academy', 'Provisions', 'ProJu'] as const

export function FounderDashboardActivityForm() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [division, setDivision] = useState<string>('Provisions')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'ADMIN_LOG',
          title: 'Manual log',
          description: description.trim(),
          division: division as (typeof DIVISIONS)[number],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to log event')
        return
      }
      setDescription('')
      router.refresh()
    } catch {
      setError('Failed to log event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mt-5 pt-5 border-t border-stone-100 min-w-0">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What happened?"
        className="flex-1 min-w-[180px] border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#1A3C34] focus:border-[#1A3C34]"
      />
      <select
        value={division}
        onChange={(e) => setDivision(e.target.value)}
        className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
      >
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !description.trim()}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1A3C34] hover:bg-[#0f2620] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Logging…' : 'Log event'}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  )
}
