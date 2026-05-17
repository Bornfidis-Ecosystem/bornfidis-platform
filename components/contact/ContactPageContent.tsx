'use client'

import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import {
  bookBody,
  bookEyebrow,
  bookFieldClass,
  bookHeadline,
  bookLabelClass,
  bookSection,
} from '@/components/booking/book-culinary-classes'
import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { BrandedCard } from '@/components/ui/BrandedCard'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { brandPhotos } from '@/lib/brand-photos'
import { marketingImages } from '@/lib/marketing-images'

const serviceOptions = [
  'Private Chef Dining',
  'Retreat / Group Catering',
  'Custom Menu Request',
  'Villa Guest Hospitality',
  'Product / Gourmet Inquiry',
  'General Inquiry',
] as const

const eventTypes = [
  'Anniversary',
  'Birthday',
  'Private Dinner',
  'Family Gathering',
  'Retreat',
  'Villa Stay',
  'Corporate / Team Event',
  'Other',
] as const

const MOSAIC = [
  { src: marketingImages.chefPresentation, alt: 'Chef presenting courses' },
  { src: marketingImages.cateringHammeredLine, alt: 'Polished service at the table' },
  { src: marketingImages.cateringBuffetRustic, alt: 'Warm buffet hospitality' },
  { src: marketingImages.cateringCharcuterie, alt: 'Curated provisions board' },
] as const

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className={bookEyebrow}>{children}</p>
}

export default function ContactPageContent() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const res = await fetch('/api/contact-booking', { method: 'POST', body: formData })
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

  return (
    <PublicMarketingShell active="contact">
      {/* Hero */}
      <section className="border-b border-[#C9A84C]/35 pt-28 md:pt-32">
        <PageContainer wide>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={bookEyebrow}>Contact &amp; custom booking</p>
              <h1 className={`${bookHeadline} mt-4 text-[clamp(2rem,5vw,3.25rem)]`}>
                Let&apos;s Shape an Experience with{' '}
                <span className="text-[#C9A84C]">Clarity and Care</span>
              </h1>
              <p className={`${bookBody} mt-6`}>
                Whether you are planning an intimate dinner, a villa stay, a retreat, or a custom hospitality
                request, Bornfidis is here to guide the next step with professionalism and warmth.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton theme="culinary" href="#contact-form">
                  Start your inquiry
                </PrimaryButton>
                <SecondaryButton
                  theme="culinary"
                  href="https://wa.me/18027335348?text=Hi%20Brian%2C%20I%27m%20interested%20in%20a%20Bornfidis%20experience."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </SecondaryButton>
              </div>
            </div>
            <HomepageBrandImage
              src={brandPhotos.hospitalityDining}
              alt="Warm hospitality — service around the table"
              variant="hero"
              priority
              className="min-h-[min(380px,50vh)] w-full"
            />
          </div>
        </PageContainer>
      </section>

      {/* Mosaic */}
      <section className="border-b border-[#C9A84C]/35 py-12 md:py-16">
        <PageContainer wide>
          <p className={`${bookEyebrow} text-center`}>In the wild</p>
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
            {MOSAIC.map((item) => (
              <div key={item.src} className="relative aspect-[4/3] overflow-hidden">
                <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Process */}
      <section className={bookSection}>
        <PageContainer wide>
          <SectionEyebrow>What to expect</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>A Simple, Professional Inquiry Process</h2>
          <p className={`${bookBody} mt-4 max-w-2xl`}>
            We keep the process clear so you can move from interest to confidence without unnecessary friction.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Share the basics',
                body: 'Tell us your date, location, guest count, and the kind of experience you’re planning.',
              },
              {
                step: '02',
                title: 'We review and guide',
                body: 'We look at fit, answer questions, and help guide you toward the right package or custom approach.',
              },
              {
                step: '03',
                title: 'Move into planning',
                body: 'Once aligned, we shape the menu, details, and next steps with calm, organized hospitality.',
              },
            ].map((card) => (
              <BrandedCard key={card.step} theme="culinary">
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C]">
                  {card.step}
                </p>
                <h3 className="mt-4 font-display text-xl text-[#2c2c2c]">{card.title}</h3>
                <p className={`${bookBody} mt-3 text-sm`}>{card.body}</p>
              </BrandedCard>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Direct contact */}
      <section className="px-6 md:px-16">
        <PageContainer wide>
          <BrandedCard theme="culinary" className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={bookEyebrow}>Prefer direct contact?</p>
              <h3 className={`${bookHeadline} mt-3 text-2xl`}>Reach Out the Way That Feels Easiest</h3>
              <p className={`${bookBody} mt-3 text-sm`}>
                For custom inquiries, collaborations, or faster guidance — email or WhatsApp.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SecondaryButton theme="culinary" href="mailto:brian@bornfidis.com">
                brian@bornfidis.com
              </SecondaryButton>
              <SecondaryButton
                theme="culinary"
                href="https://wa.me/18027335348"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </SecondaryButton>
            </div>
          </BrandedCard>
        </PageContainer>
      </section>

      {/* Form */}
      <section id="contact-form" className={`${bookSection} scroll-mt-28 border-b-0`}>
        <PageContainer wide>
          <SectionEyebrow>Inquiry form</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>Tell Us About Your Request</h2>
          <p className={`${bookBody} mt-4`}>Share the essentials below and we&apos;ll review your request with care.</p>

          <div className="mt-12 border border-[#C9A84C]/35 bg-[#fdf8f8] p-6 md:p-10">
            {error ? (
              <div className="mb-6 border border-red-300 bg-red-50 p-4 font-sans text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                <label htmlFor="website_url">Website URL</label>
                <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={bookLabelClass}>
                    First name
                  </label>
                  <input id="firstName" name="firstName" type="text" required className={bookFieldClass} />
                </div>
                <div>
                  <label htmlFor="lastName" className={bookLabelClass}>
                    Last name
                  </label>
                  <input id="lastName" name="lastName" type="text" required className={bookFieldClass} />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className={bookLabelClass}>
                    Email
                  </label>
                  <input id="email" name="email" type="email" className={bookFieldClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={bookLabelClass}>
                    Phone / WhatsApp <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    required
                    minLength={10}
                    className={bookFieldClass}
                  />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <label htmlFor="serviceType" className={bookLabelClass}>
                    Service type
                  </label>
                  <select id="serviceType" name="serviceType" defaultValue="" className={bookFieldClass}>
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
                  <label htmlFor="eventType" className={bookLabelClass}>
                    Event type
                  </label>
                  <select id="eventType" name="eventType" defaultValue="" className={bookFieldClass}>
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

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <label htmlFor="eventDate" className={bookLabelClass}>
                    Preferred date <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    required
                    min={minDate}
                    className={bookFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="guestCount" className={bookLabelClass}>
                    Guest count
                  </label>
                  <input
                    id="guestCount"
                    name="guestCount"
                    type="number"
                    min={1}
                    placeholder="e.g. 8"
                    className={bookFieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className={bookLabelClass}>
                  Location / venue <span className="text-red-600">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  minLength={10}
                  placeholder="Port Antonio villa, private home, retreat venue…"
                  className={bookFieldClass}
                />
              </div>

              <div>
                <label htmlFor="budget" className={bookLabelClass}>
                  Budget range
                </label>
                <input id="budget" name="budget" type="text" placeholder="Optional" className={bookFieldClass} />
              </div>

              <div>
                <label htmlFor="details" className={bookLabelClass}>
                  Tell us more
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={6}
                  placeholder="Your vision, menu preferences, dietary needs, and anything important for us to know."
                  className={`${bookFieldClass} resize-y`}
                />
              </div>

              <p className={`${bookBody} border-t border-[#C9A84C]/25 pt-6 text-sm`}>
                By submitting, you are requesting a response regarding service availability and fit. A submitted
                form does not automatically confirm a booking.
              </p>

              <PrimaryButton
                theme="culinary"
                type="submit"
                disabled={submitting}
                className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit inquiry'}
              </PrimaryButton>

              <p className="text-center font-sans text-xs text-[#2c2c2c]/55">
                We respond within 24 hours. No spam. Your details are handled with care.
              </p>
            </form>
          </div>

          <p className={`${bookBody} mt-8 text-center text-sm`}>
            Prefer the full booking flow?{' '}
            <Link href="/book" className="text-[#C9A84C] no-underline hover:text-[#2c2c2c]">
              Book private dining →
            </Link>
          </p>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
