'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Provisions interest capture — lightweight stub.
 * Wire to your email platform when ready.
 */
export function ProvisionsEmailCapture() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success("Thanks! We'll notify you about new products and drops.")
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
      <div className="rounded-2xl border border-forest/20 bg-forest/5 p-6 text-center">
        <p className="text-forest font-medium">You’re on the list for product updates.</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-forest/20 bg-forest/5 p-6 md:p-8" aria-labelledby="provisions-email-heading">
      <h2 id="provisions-email-heading" className="text-lg font-bold text-navy mb-2 text-center">
        Get first access to new products
      </h2>
      <p className="text-gray-600 text-center text-sm mb-4">
        Join the list for small-batch drops and availability. No spam.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <label htmlFor="provisions-email" className="sr-only">Email</label>
        <input
          id="provisions-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-300 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-forest text-goldAccent font-semibold hover:opacity-90 transition disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? 'Sending…' : 'Join list'}
        </button>
      </form>
    </section>
  )
}
