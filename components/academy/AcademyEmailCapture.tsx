'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Academy email capture — lightweight stub for launch.
 * Submit shows success toast; no backend integration yet. Wire to your email platform later.
 */
export function AcademyEmailCapture() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      // Stub: no API call. Replace with POST to your email/list endpoint when ready.
      await new Promise((r) => setTimeout(r, 400))
      toast.success("Thanks! We'll notify you about new guides and updates.")
      setSubmitted(true)
      setEmail('')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-forest/20 bg-forest/5 p-8 text-center">
        <p className="text-forest font-medium">You’re on the list. We’ll be in touch.</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-forest/20 bg-forest/5 p-8 md:p-10" aria-labelledby="academy-email-heading">
      <h2 id="academy-email-heading" className="text-xl font-bold text-forest mb-2 text-center">
        Stay in the loop
      </h2>
      <p className="text-gray-600 text-center text-sm mb-6 max-w-md mx-auto">
        Get notified when we release new guides, templates, and Academy updates. No spam.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <label htmlFor="academy-email" className="sr-only">
          Email address
        </label>
        <input
          id="academy-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-300 text-forest placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-forest text-goldAccent font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Sending…' : 'Notify me'}
        </button>
      </form>
    </section>
  )
}
