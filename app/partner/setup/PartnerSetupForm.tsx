'use client'

import { useState } from 'react'
import { savePartnerProfile } from './actions'

export default function PartnerSetupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    displayName: '',
    partnerType: 'FARMER' as 'FARMER' | 'CHEF' | 'COOPERATIVE' | 'OTHER',
    parish: '',
    phone: '',
    bio: '',
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await savePartnerProfile(form)
      window.location.href = '/partner'
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-lg">
      {/* Step 1 — Identity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Identity</h2>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display name *
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-700 focus:border-transparent"
            placeholder="e.g. Maria's Farm"
          />
        </div>
        <div>
          <label htmlFor="partnerType" className="block text-sm font-medium text-gray-700 mb-1">
            Partner type *
          </label>
          <select
            id="partnerType"
            value={form.partnerType}
            onChange={(e) =>
              setForm((f) => ({ ...f, partnerType: e.target.value as typeof form.partnerType }))
            }
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-700 focus:border-transparent"
          >
            <option value="FARMER">Farmer</option>
            <option value="CHEF">Chef</option>
            <option value="COOPERATIVE">Cooperative</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Step 2 — Contact & Location */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Contact & Location</h2>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-700 focus:border-transparent"
            placeholder="e.g. 876-555-1234"
          />
        </div>
        <div>
          <label htmlFor="parish" className="block text-sm font-medium text-gray-700 mb-1">
            Parish / region (optional)
          </label>
          <input
            id="parish"
            type="text"
            value={form.parish}
            onChange={(e) => setForm((f) => ({ ...f, parish: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-700 focus:border-transparent"
            placeholder="e.g. Portland"
          />
        </div>
      </div>

      {/* Step 3 — About */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">About</h2>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Short bio (optional)
          </label>
          <textarea
            id="bio"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-700 focus:border-transparent"
            placeholder="Who you are / what you offer"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-green-700 px-4 py-2 text-white font-semibold hover:bg-green-800 transition disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Complete Setup'}
      </button>
    </form>
  )
}
