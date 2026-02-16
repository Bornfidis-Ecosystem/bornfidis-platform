'use client'

import { useState } from 'react'
import { setReviewHidden, flagChefForCoaching, requireChefRefresherEducation } from '../actions'
import type { ReviewWithBooking } from '@/lib/reviews'

type Props = {
  chefId: string
  stats: { averageRating: number; count: number }
  reviews: ReviewWithBooking[]
}

export default function ChefReviewsSection({ chefId, stats, reviews }: Props) {
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({})

  async function toggleHidden(reviewId: string, currentlyHidden: boolean) {
    const next = !currentlyHidden
    setOptimistic((o) => ({ ...o, [reviewId]: next }))
    const { success, error } = await setReviewHidden(reviewId, next)
    if (!success) {
      setOptimistic((o) => {
        const u = { ...o }
        delete u[reviewId]
        return u
      })
      alert(error || 'Failed to update')
    }
  }

  if (reviews.length === 0 && stats.count === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Reviews (Phase 2U)</h2>
        <p className="text-sm text-gray-600">No reviews yet.</p>
      </section>
    )
  }

  const [actionMessage, setActionMessage] = useState<string | null>(null)

  async function handleFlagCoaching() {
    const { success, error } = await flagChefForCoaching(chefId)
    if (success) setActionMessage('Chef flagged for coaching.')
    else alert(error || 'Failed')
  }
  async function handleRequireRefresher() {
    const { success, error } = await requireChefRefresherEducation(chefId)
    if (success) setActionMessage('Refresher education required.')
    else alert(error || 'Failed')
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Reviews (Phase 2U)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Average: <strong>{stats.averageRating.toFixed(1)}</strong> ★ — {stats.count} review{stats.count !== 1 ? 's' : ''}
      </p>
      {/* Phase 2W: Admin actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={handleFlagCoaching}
          className="text-xs px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-800 rounded hover:bg-amber-100"
        >
          Flag for coaching
        </button>
        <button
          type="button"
          onClick={handleRequireRefresher}
          className="text-xs px-3 py-1.5 border border-blue-300 bg-blue-50 text-blue-800 rounded hover:bg-blue-100"
        >
          Require refresher education
        </button>
      </div>
      {actionMessage && (
        <p className="text-sm text-green-700 mb-2">
          {actionMessage}
          <button type="button" onClick={() => setActionMessage(null)} className="ml-2 text-xs underline">Dismiss</button>
        </p>
      )}
      <ul className="space-y-3">
        {reviews.map((r) => {
          const isHidden = optimistic[r.id] !== undefined ? optimistic[r.id] : r.hidden
          return (
            <li
              key={r.id}
              className={`border rounded-lg p-3 text-sm ${isHidden ? 'bg-gray-100 border-gray-200 opacity-75' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-medium text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  {isHidden && <span className="ml-2 text-amber-600 font-medium">(hidden)</span>}
                </div>
                <button
                  type="button"
                  onClick={() => toggleHidden(r.id, isHidden)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                >
                  {isHidden ? 'Unhide' : 'Hide'}
                </button>
              </div>
              {r.comment && <p className="mt-2 text-gray-700 whitespace-pre-wrap">{r.comment}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

