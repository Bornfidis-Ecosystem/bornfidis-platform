'use client'

import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { brandPhotos } from '@/lib/brand-photos'
import { marketingImages } from '@/lib/marketing-images'

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

const MOSAIC = [
  {
    src: marketingImages.chefPresentation,
    alt: 'Chef presenting courses — craft and care at the table',
  },
  {
    src: marketingImages.cateringHammeredLine,
    alt: 'Polished service — chafing line and silver',
  },
  {
    src: marketingImages.cateringBuffetRustic,
    alt: 'Warm buffet — seasonal hospitality',
  },
  {
    src: marketingImages.cateringCharcuterie,
    alt: 'Curated provisions — boards and abundance',
  },
] as const

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{children}</p>
  )
}

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

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
    'w-full rounded-2xl border border-rule/80 bg-white px-4 py-3 text-forestDark shadow-inner shadow-midnight/[0.04] outline-none transition placeholder:text-muted focus:border-gold/50 focus:ring-2 focus:ring-gold/15'

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/25 via-stone-50 to-cream/35 text-forestDark">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-midnight text-cream">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={brandPhotos.jamaicaStream}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-midnight/93 via-forestDark/78 to-midnight/90" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_80%_at_20%_0%,rgba(200,150,62,0.12)_0%,transparent_45%),radial-gradient(ellipse_90%_60%_at_100%_100%,rgba(46,107,79,0.18)_0%,transparent_50%)]" />
        <div className="home-brutalist-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay" aria-hidden />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_48%,transparent_100%)] opacity-60" />

        <div className="relative z-[2] flex justify-end px-6 pt-5 md:px-10">
          <Link
            href="/"
            className="text-sm font-medium text-brass/95 transition hover:text-cream"
          >
            ← Home
          </Link>
        </div>

        <div className="relative z-[2] mx-auto grid max-w-7xl gap-14 px-6 pb-20 md:px-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-16 lg:pb-28">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center rounded-full border border-gold/35 bg-midnight/30 px-4 py-1.5 text-sm tracking-wide text-brass backdrop-blur-md">
              Contact & Custom Booking
            </p>

            <h1 className="font-display text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-cream md:text-5xl lg:text-[3.25rem]">
              Let’s Shape an Experience with{' '}
              <span className="text-gold">Clarity and Care</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream/88">
              Whether you are planning an intimate dinner, a villa stay, a retreat, or a custom hospitality request,
              Bornfidis is here to guide the next step with professionalism and warmth.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact-form"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-center text-sm font-semibold text-midnight shadow-lg shadow-black/30 transition hover:bg-brass"
              >
                Start Your Inquiry
              </a>

              <a
                href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20a%20Bornfidis%20experience%20and%20would%20love%20some%20guidance."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-cream/35 bg-white/[0.06] px-8 py-3.5 text-center text-sm font-medium text-cream backdrop-blur-sm transition hover:bg-white/12"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <HomepageBrandImage
              src={brandPhotos.hospitalityDining}
              alt="Warm hospitality — service around the table"
              variant="hero"
              priority
              className="min-h-[min(420px,52vh)] w-full max-w-lg lg:max-w-none"
            />
          </div>
        </div>
      </section>

      {/* Editorial mosaic — proof of craft */}
      <section className="border-y border-gold/10 bg-midnight py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="mb-8 text-center text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brass/90">
            In the wild
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {MOSAIC.map((item, i) => (
              <motion.div
                key={item.src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-32px' }}
                transition={{
                  duration: 0.5,
                  delay: prefersReducedMotion ? 0 : i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <SectionEyebrow>What to Expect</SectionEyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
            A Simple and Professional Inquiry Process
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-forestDark/85">
            We keep the process clear so you can move from interest to confidence without unnecessary friction.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Share the Basics',
              body: 'Tell us your date, location, guest count, and the kind of experience you’re planning.',
            },
            {
              step: '02',
              title: 'We Review and Guide',
              body: 'We look at fit, answer questions, and help guide you toward the right package or custom approach.',
            },
            {
              step: '03',
              title: 'Move Into Planning',
              body: 'Once aligned, we shape the menu, details, and next steps with calm, organized hospitality.',
            },
          ].map((card) => (
            <div
              key={card.step}
              className="group rounded-3xl border border-gold/10 bg-white/90 p-8 shadow-[0_12px_48px_-16px_rgba(13,31,45,0.12)] backdrop-blur-[2px] transition hover:border-gold/25 hover:shadow-[0_16px_56px_-16px_rgba(13,31,45,0.16)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{card.step}</p>
              <h3 className="mt-5 text-xl font-semibold text-midnight">{card.title}</h3>
              <p className="mt-4 leading-relaxed text-forestDark/82">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIRECT CONTACT STRIP */}
      <section className="mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-midnight via-midnight to-harbour px-8 py-10 text-cream shadow-2xl shadow-midnight/25 ring-1 ring-gold/15 md:px-10 md:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">Prefer Direct Contact?</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                Reach Out the Way That Feels Easiest
              </h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-cream/85">
                For custom inquiries, collaborations, or faster guidance, you can also connect directly by email or
                WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:brian@bornfidis.com"
                className="inline-flex justify-center rounded-full border border-cream/30 px-6 py-3 text-sm font-medium text-cream transition hover:bg-white/10"
              >
                brian@bornfidis.com
              </a>
              <a
                href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20a%20Bornfidis%20experience%20and%20would%20love%20some%20guidance."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center rounded-full border border-cream/30 px-6 py-3 text-sm font-medium text-cream transition hover:bg-white/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact-form" className="scroll-mt-8 bg-gradient-to-b from-cream/30 to-stone-100/90">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="max-w-3xl">
            <SectionEyebrow>Inquiry Form</SectionEyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
              Tell Us About Your Request
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-forestDark/85">
              Share the essentials below and we’ll review your request with care.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-rule/60 bg-white/95 p-6 shadow-2xl shadow-midnight/[0.08] ring-1 ring-white/80 md:p-10">
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
                  <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-forestDark/90">
                    First Name
                  </label>
                  <input id="firstName" name="firstName" type="text" required className={inputClass} />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-forestDark/90">
                    Last Name
                  </label>
                  <input id="lastName" name="lastName" type="text" required className={inputClass} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-forestDark/90">
                    Email Address
                  </label>
                  <input id="email" name="email" type="email" className={inputClass} />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-forestDark/90">
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
                  <label htmlFor="serviceType" className="mb-2 block text-sm font-medium text-forestDark/90">
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
                  <label htmlFor="eventType" className="mb-2 block text-sm font-medium text-forestDark/90">
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
                  <label htmlFor="eventDate" className="mb-2 block text-sm font-medium text-forestDark/90">
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
                  <label htmlFor="guestCount" className="mb-2 block text-sm font-medium text-forestDark/90">
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
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-forestDark/90">
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
                <label htmlFor="budget" className="mb-2 block text-sm font-medium text-forestDark/90">
                  Budget Range
                </label>
                <input id="budget" name="budget" type="text" placeholder="Optional" className={inputClass} />
              </div>

              <div>
                <label htmlFor="details" className="mb-2 block text-sm font-medium text-forestDark/90">
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

              <div className="rounded-2xl border border-gold/15 bg-cream/25 p-5">
                <p className="text-sm leading-relaxed text-forestDark/85">
                  By submitting this inquiry, you are requesting a response from Bornfidis regarding service availability
                  and fit. A submitted form does not automatically confirm a booking.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-midnight px-6 py-4 text-sm font-semibold text-cream shadow-lg shadow-midnight/30 transition hover:bg-harbour disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>

              <p className="mt-3 text-center text-sm leading-relaxed text-muted">
                We respond within 24 hours. No spam. Your details are handled with care.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-gold/10 bg-midnight text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 md:py-24">
          <SectionEyebrow>Ready When You Are</SectionEyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            Let’s Start the Conversation
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-cream/85">
            If you are ready to inquire or need support choosing the right path, Bornfidis is here to guide you with
            clarity and care.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contact-form"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-midnight shadow-lg transition hover:bg-brass"
            >
              Start Your Inquiry
            </a>

            <Link
              href="/book"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-cream/35 px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-white/10"
            >
              View Booking Options
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
