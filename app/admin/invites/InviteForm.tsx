'use client'

import { useState } from 'react'

const ROLES = [
  { value: 'FARMER', label: 'Farmer' },
  { value: 'CHEF', label: 'Chef' },
  { value: 'EDUCATOR', label: 'Educator' },
  { value: 'PARTNER', label: 'Partner' },
] as const

export default function InviteForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('PARTNER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email?.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEmail('')
        window.location.reload()
      } else {
        setError(data.error ?? 'Failed to send invite')
      }
    } catch {
      setError('Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div>
        <input
          type="email"
          placeholder="email@example.com"
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-navy focus:border-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-navy focus:border-transparent bg-white"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="rounded bg-green-700 px-4 py-2 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending…' : 'Send invite'}
      </button>
      {error && (
        <p className="w-full text-sm text-red-600 mt-1">{error}</p>
      )}
    </form>
  )
}
