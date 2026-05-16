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
    <form
      onSubmit={handleSubmit}
      className="mt-5 flex min-w-0 flex-wrap items-end gap-3 border-t border-culinary-outline pt-5 font-culinary-sans"
    >
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What happened?"
        className="min-w-[180px] flex-1 rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 text-sm text-culinary-ink placeholder:text-culinary-text-muted focus:border-culinary-navy focus:outline-none focus:ring-1 focus:ring-culinary-navy/30"
      />
      <select
        value={division}
        onChange={(e) => setDivision(e.target.value)}
        className="rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 text-sm text-culinary-ink focus:border-culinary-navy focus:outline-none focus:ring-1 focus:ring-culinary-navy/30"
      >
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !description.trim()}
        className="rounded-none bg-culinary-navy px-4 py-2 text-sm font-medium text-culinary-on-navy transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Logging…' : 'Log event'}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  )
}
