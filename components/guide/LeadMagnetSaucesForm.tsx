'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const API_URL = '/api/lead-magnet/5-caribbean-sauces'

export function LeadMagnetSaucesForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      toast.success('Check your inbox — your free guide is on the way.')
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
      <div className="rounded-2xl border border-forest/20 bg-forest/5 p-8 md:p-10 text-center max-w-xl mx-auto">
        <p className="text-forest font-semibold text-lg mb-2">
          Check your inbox — your free guide is on the way.
        </p>
        <p className="text-gray-600 text-sm mb-6">
          We sent the guide to your email. If you don’t see it, check spam or promotions.
        </p>
        <Link
          href="/academy"
          className="inline-block px-5 py-2.5 rounded-xl bg-forest text-goldAccent font-semibold hover:opacity-90 transition"
        >
          Explore the Academy
        </Link>
      </div>
    )
  }

  return (
    <section
      className="rounded-2xl border border-forest/20 bg-forest/5 p-6 md:p-8 max-w-xl mx-auto"
      aria-labelledby="guide-email-heading"
    >
      <h2 id="guide-email-heading" className="text-lg font-bold text-navy mb-2 text-center">
        Get the free guide
      </h2>
      <p className="text-gray-600 text-center text-sm mb-5">
        Enter your email and we’ll send the PDF straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="guide-email" className="sr-only">
          Email
        </label>
        <input
          id="guide-email"
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
          {loading ? 'Sending…' : 'Send me the guide'}
        </button>
      </form>
      <p className="text-center text-xs text-gray-500 mt-4">
        Free instant delivery · No spam · Unsubscribe anytime
      </p>
    </section>
  )
}
