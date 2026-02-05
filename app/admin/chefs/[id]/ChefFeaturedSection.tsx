'use client'

import { useState } from 'react'
import { setChefFeaturedAction } from '../actions'
import type { FeaturedEligibility } from '@/lib/featured-chefs'

type Props = {
  chefId: string
  initialFeatured: boolean
  initialAdminOverride: boolean
  eligibility: FeaturedEligibility
}

export default function ChefFeaturedSection({
  chefId,
  initialFeatured,
  initialAdminOverride,
  eligibility,
}: Props) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [adminOverride, setAdminOverride] = useState(initialAdminOverride)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const { success, error } = await setChefFeaturedAction(chefId, featured, adminOverride)
    setSaving(false)
    if (success) {
      setMessage('Saved.')
    } else {
      setMessage(error || 'Failed to save')
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Featured (Phase 2X)</h2>
      <p className="text-sm text-gray-600 mb-2">
        Featured chefs appear at the top of the booking flow. Max 5. Eligibility: avg rating ≥ 4.7, Certified Chef + On-Time Pro badges, no low-rating flags.
      </p>
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span className="font-medium">Featured</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={adminOverride}
            onChange={(e) => setAdminOverride(e.target.checked)}
          />
          Admin override (feature even if ineligible)
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-[#1a5f3f] text-white rounded text-sm hover:bg-[#154a32] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {message && <p className={`text-sm mb-2 ${message === 'Saved.' ? 'text-green-700' : 'text-red-600'}`}>{message}</p>}
      <div className="text-xs text-gray-500">
        Eligibility: {eligibility.eligible ? 'Yes' : 'No'}
        {eligibility.reason && ` — ${eligibility.reason}`}
        {' · '}Rating: {eligibility.averageRating.toFixed(1)} ({eligibility.reviewCount} reviews)
        {eligibility.flaggedCount > 0 && ` · ${eligibility.flaggedCount} low-rating`}
      </div>
    </section>
  )
}
