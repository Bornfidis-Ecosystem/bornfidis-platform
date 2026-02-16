'use client'

import { useState } from 'react'
import { removeIneligibleFeaturedAction } from '@/app/admin/chefs/actions'

export function RemoveIneligibleFeaturedButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ removed: string[] } | null>(null)

  async function handleClick() {
    setLoading(true)
    setResult(null)
    const res = await removeIneligibleFeaturedAction()
    setLoading(false)
    if (res.success && res.removed.length >= 0) setResult({ removed: res.removed })
    else if (!res.success) alert(res.error || 'Failed')
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-sm px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-800 rounded hover:bg-amber-100 disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Remove ineligible featured (weekly review)'}
      </button>
      {result && result.removed.length > 0 && (
        <p className="text-sm text-amber-700 mt-2">Removed featured from {result.removed.length} chef(s).</p>
      )}
      {result && result.removed.length === 0 && (
        <p className="text-sm text-gray-600 mt-2">All featured chefs are still eligible.</p>
      )}
    </div>
  )
}

