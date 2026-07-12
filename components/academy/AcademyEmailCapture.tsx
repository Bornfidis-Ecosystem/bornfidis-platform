'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  academyBody,
  academyBtnPrimary,
  academyEyebrow,
  academyFieldClass,
  academyHeadline,
} from '@/components/academy/academy-culinary-classes'

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
      <section className="border border-gold/35 p-8 text-center" aria-live="polite">
        <p className={academyBody}>You&apos;re on the list. We&apos;ll be in touch.</p>
      </section>
    )
  }

  return (
    <section
      className="border border-gold/35 p-8 md:p-10"
      aria-labelledby="academy-email-heading"
    >
      <p className={`${academyEyebrow} text-center`}>Stay in the loop</p>
      <h2 id="academy-email-heading" className={`${academyHeadline} mt-3 text-center text-2xl`}>
        New guides &amp; updates
      </h2>
      <p className={`${academyBody} mx-auto mt-3 max-w-md text-center text-sm`}>
        Get notified when we release new manuals and Academy updates. No spam.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row">
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
          className={`${academyFieldClass} flex-1`}
        />
        <button type="submit" disabled={loading} className={`${academyBtnPrimary} whitespace-nowrap`}>
          {loading ? 'Sending…' : 'Notify me'}
        </button>
      </form>
    </section>
  )
}
