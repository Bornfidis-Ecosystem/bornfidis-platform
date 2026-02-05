'use client'

import { useState } from 'react'

type Props = { token: string; chefName: string; onSubmitted: () => void }

export function ReviewForm({ token, chefName, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1 || rating > 5) {
      setError('Please choose a rating (1–5 stars).')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/${token}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        onSubmitted()
      } else {
        setError(data.error || 'Failed to submit review')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-gray-700">How was your chef? Your review is verified and helps other clients.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating (required)</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl focus:outline-none"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              {rating >= star ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-[#1a5f3f] text-white rounded font-medium hover:bg-[#154a32] disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
