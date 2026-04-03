'use client'

import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'

const serviceOptions = [
  'Private Chef Dining',
  'Retreat / Group Catering',
  'Custom Menu Request',
  'Villa Guest Hospitality',
  'Product / Gourmet Inquiry',
  'General Inquiry',
]

const eventTypes = [
  'Anniversary',
  'Birthday',
  'Private Dinner',
  'Family Gathering',
  'Retreat',
  'Villa Stay',
  'Corporate / Team Event',
  'Other',
]

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9D7C2F]">
      {children}
    </p>
  )
}

function PlaceholderVisual({
  title,
  subtitle,
  className = '',
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/30 bg-[linear-gradient(135deg,#EDE5D6_0%,#DCCFB6_100%)] ${className}`}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.35)_0,transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,61,46,0.18)_0,transparent_30%)]" />
      <div className="relative flex h-full min-h-[220px] flex-col justify-end p-6">
        <p className="text-lg font-semibold text-[#0F3D2E]">{title}</p>
        {subtitle ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-[#25483C]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      const res = await fetch('/api/contact-booking', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      e.currentTarget.reset()
      window.location.href = '/thanks'
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-[#E8E1D2] bg-white px-4 py-3 text-[#0F3D2E] placeholder:text-stone-400 outline-none transition focus:border-[#0F3D2E]/40 focus:ring-2 focus:ring-[#0F3D2E]/25'

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0F3D2E]">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0F3D2E] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.22)_0,transparent_28%),radial-gradient(circle_at_bottom_right,rgba(201,168,76,0.10)_0,transparent_22%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_100%)]" />

        <div className="relative flex justify-end px-6 pt-4 md:px-10">
          <Link href="/" className="text-sm text-white/80 transition hover:text-[#E8D9B5]">
            ← Home
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-[#C9A84C]/40 bg-white/5 px-4 py-1 text-sm tracking-wide text-[#E8D9B5]">
              Contact & Custom Booking
            </p>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Let’s Shape an Experience with{' '}
              <span className="text-[#C9A84C]">Clarity and Care</span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
              Whether you are planning an intimate dinner, a villa stay, a retreat, or a custom hospitality request,
              Bornfidis is here to guide the next step with professionalism and warmth.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact-form"
                className="rounded-full bg-[#C9A84C] px-6 py-3 text-center font-medium text-[#0F3D2E] transition hover:opacity-90"
              >
                Start Your Inquiry
              </a>

              <a
                href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20a%20Bornfidis%20experience%20and%20would%20love%20some%20guidance."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/30 px-6 py-3 text-center font-medium text-white transition hover:bg-white/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div>
            <PlaceholderVisual
              title="Custom Hospitality Inquiry"
              subtitle="Reserved for future visual storytelling: service moments, table setups, or hospitality atmosphere."
              className="min-h-[360px]"
            />
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="max-w-3xl">
          <SectionEyebrow>What to Expect</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">A Simple and Professional Inquiry Process</h2>
          <p className="mt-6 text-lg leading-8 text-[#25483C]">
            We keep the process clear so you can move from interest to confidence without unnecessary friction.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[#E8E1D2] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-[#9D7C2F]">01</p>
            <h3 className="mt-4 text-2xl font-semibold">Share the Basics</h3>
            <p className="mt-4 leading-7 text-[#25483C]">
              Tell us your date, location, guest count, and the kind of experience you’re planning.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8E1D2] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-[#9D7C2F]">02</p>
            <h3 className="mt-4 text-2xl font-semibold">We Review and Guide</h3>
            <p className="mt-4 leading-7 text-[#25483C]">
              We look at fit, answer questions, and help guide you toward the right package or custom approach.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8E1D2] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-[#9D7C2F]">03</p>
            <h3 className="mt-4 text-2xl font-semibold">Move Into Planning</h3>
            <p className="mt-4 leading-7 text-[#25483C]">
              Once aligned, we shape the menu, details, and next steps with calm, organized hospitality.
            </p>
          </div>
        </div>
      </section>

      {/* DIRECT CONTACT STRIP */}
      <section className="mx-auto max-w-7xl px-6 pb-8 md:px-10">
        <div className="rounded-3xl bg-[#0F3D2E] px-6 py-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#E8D9B5]">Prefer Direct Contact?</p>
              <h3 className="mt-2 text-2xl font-semibold">Reach Out the Way That Feels Easiest</h3>
              <p className="mt-2 max-w-2xl text-white/85">
                For custom inquiries, collaborations, or faster guidance, you can also connect directly by email or
                WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:brian@bornfidis.com"
                className="inline-flex justify-center rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                brian@bornfidis.com
              </a>
              <a
                href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20a%20Bornfidis%20experience%20and%20would%20love%20some%20guidance."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact-form" className="scroll-mt-8 bg-[#EDE5D6]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <SectionEyebrow>Inquiry Form</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Tell Us About Your Request</h2>
            <p className="mt-4 text-lg leading-8 text-[#25483C]">
              Share the essentials below and we’ll review your request with care.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-[#E8E1D2] bg-white p-6 shadow-sm md:p-10">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="relative space-y-6">
              <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                <label htmlFor="website_url">Website URL</label>
                <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#25483C]">
                    First Name
                  </label>
                  <input id="firstName" name="firstName" type="text" required className={inputClass} />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Last Name
                  </label>
                  <input id="lastName" name="lastName" type="text" required className={inputClass} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Email Address
                  </label>
                  <input id="email" name="email" type="email" className={inputClass} />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    required
                    minLength={10}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="serviceType" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="eventType" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Event Type
                  </label>
                  <select id="eventType" name="eventType" defaultValue="" className={inputClass}>
                    <option value="" disabled>
                      Select an event type
                    </option>
                    {eventTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="eventDate" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    required
                    min={minDate}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="guestCount" className="mb-2 block text-sm font-medium text-[#25483C]">
                    Guest Count
                  </label>
                  <input
                    id="guestCount"
                    name="guestCount"
                    type="number"
                    min={1}
                    placeholder="e.g. 8"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-[#25483C]">
                  Location / Venue <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  minLength={10}
                  placeholder="Port Antonio villa, private home, retreat venue, etc."
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="budget" className="mb-2 block text-sm font-medium text-[#25483C]">
                  Budget Range
                </label>
                <input id="budget" name="budget" type="text" placeholder="Optional" className={inputClass} />
              </div>

              <div>
                <label htmlFor="details" className="mb-2 block text-sm font-medium text-[#25483C]">
                  Tell Us More
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={6}
                  placeholder="Share your vision, menu preferences, dietary needs, guest profile, and anything important for us to know."
                  className={inputClass}
                />
              </div>

              <div className="rounded-2xl border border-[#E8E1D2] bg-[#F7F3EA] p-5">
                <p className="text-sm leading-7 text-[#25483C]">
                  By submitting this inquiry, you are requesting a response from Bornfidis regarding service availability
                  and fit. A submitted form does not automatically confirm a booking.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#0F3D2E] px-6 py-4 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>

              <p className="mt-3 text-center text-sm leading-6 text-[#25483C]/70">
                We respond within 24 hours. No spam. Your details are handled with care.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#0F3D2E] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10">
          <SectionEyebrow>Ready When You Are</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">Let’s Start the Conversation</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/85">
            If you are ready to inquire or need support choosing the right path, Bornfidis is here to guide you with
            clarity and care.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#contact-form"
              className="rounded-full bg-[#C9A84C] px-6 py-3 font-medium text-[#0F3D2E] transition hover:opacity-90"
            >
              Start Your Inquiry
            </a>

            <Link
              href="/book"
              className="rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              View Booking Options
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
