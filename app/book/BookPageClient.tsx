'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitBooking } from '@/app/actions'
import { submitWithOfflineFallback } from '@/lib/offline-sync'
import { toast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { PROVISIONS_FLAGSHIP_PRODUCTS } from '@/lib/provisions-products'
import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { homepageImages } from '@/lib/homepage-images'
import { bookImages } from '@/lib/book-images'

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9D7C2F]">{children}</p>
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

const howItWorks = [
  {
    step: '01',
    title: 'Tell us what you need',
    body: 'Share your date, location, guest count, and the experience you want — in one clear inquiry.',
  },
  {
    step: '02',
    title: 'We guide the plan',
    body: 'We review fit, answer questions, and help shape menu direction, timing, and budget with care.',
  },
  {
    step: '03',
    title: 'Execute with excellence',
    body: 'From prep to table, Bornfidis delivers calm, organized hospitality worthy of the occasion.',
  },
]

const servicePackages = [
  {
    title: 'Intimate Dining',
    description:
      'Refined private chef experiences for couples, anniversaries, and meaningful small gatherings.',
    imageKey: 'serviceIntimate' as const,
  },
  {
    title: 'Gathering Experience',
    description:
      'Warm, abundant dining for families, birthdays, and shared table celebrations.',
    imageKey: 'serviceGathering' as const,
  },
  {
    title: 'Retreat & Events',
    description:
      'Structured hospitality for retreats, villas, and curated multi-guest experiences.',
    imageKey: 'serviceRetreat' as const,
  },
] as const

const experienceTypes = [
  { value: '', label: 'Select experience type' },
  { value: 'Intimate Dining', label: 'Intimate Dining' },
  { value: 'Gathering Experience', label: 'Gathering Experience' },
  { value: 'Retreat & Events', label: 'Retreat & Events' },
  { value: 'Not sure yet', label: 'Not sure yet — guide me' },
]

const menuPreferences = [
  { value: '', label: 'Select menu preference' },
  { value: 'Caribbean-forward', label: 'Caribbean-forward' },
  { value: 'Classic / crowd-pleasing', label: 'Classic / crowd-pleasing' },
  { value: 'Plant-forward', label: 'Plant-forward' },
  { value: "Chef's choice", label: "Chef's choice" },
  { value: 'Still deciding', label: 'Still deciding' },
]

const budgetRanges = [
  { value: '', label: 'Select budget range' },
  { value: 'under_1000', label: 'Under $1,000' },
  { value: '1000_2000', label: '$1,000 – $2,000' },
  { value: '2000_5000', label: '$2,000 – $5,000' },
  { value: '5000_plus', label: '$5,000+' },
  { value: 'flexible', label: 'Flexible / not sure' },
]

/** Island Fire | Maple Jerk (center, hero product shot) | Tamarind */
const provisionsAddOns = [
  PROVISIONS_FLAGSHIP_PRODUCTS[1],
  PROVISIONS_FLAGSHIP_PRODUCTS[0],
  PROVISIONS_FLAGSHIP_PRODUCTS[2],
]

export default function BookPageClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    location: '',
    guests: '',
    experienceType: '',
    menuPreference: '',
    budgetRange: '',
    notes: '',
    website_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload = {
      ...formData,
      eventTime: '',
      dietaryRestrictions: '',
    }

    try {
      const offlineResult = await submitWithOfflineFallback(payload, '/api/submit-booking')

      if (offlineResult.success) {
        toast.success('Booking submitted successfully!')
        router.push('/thanks')
      } else if (offlineResult.offline) {
        toast.info("Your booking has been saved offline and will be submitted when you're back online.")
        router.push('/thanks')
      } else {
        setError(offlineResult.error || 'Something went wrong. Please try again.')
        toast.error(offlineResult.error || 'Failed to submit booking')
      }
    } catch {
      try {
        const result = await submitBooking(payload)

        if (result.success) {
          toast.success('Booking submitted successfully!')
          router.push('/thanks')
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
          toast.error(result.error || 'Failed to submit booking')
        }
      } catch {
        setError('An unexpected error occurred. Please try again.')
        toast.error('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-[#E8E1D2] rounded-xl bg-white text-[#0F3D2E] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/25 focus:border-[#0F3D2E]/40'

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0F3D2E]">
      {/* 1. Hero — text left, image right (desktop) */}
      <section className="relative isolate overflow-hidden bg-[#0F3D2E] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.22)_0,transparent_28%),radial-gradient(circle_at_bottom_right,rgba(201,168,76,0.10)_0,transparent_22%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_100%)]" />

        <div className="relative flex justify-end px-6 pt-4 md:px-10">
          <Link href="/" className="text-sm text-white/80 transition hover:text-[#E8D9B5]">
            ← Home
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24">
          <div className="order-2 max-w-3xl lg:order-1">
            <p className="mb-4 inline-block rounded-full border border-[#C9A84C]/40 bg-white/5 px-4 py-1 text-sm tracking-wide text-[#E8D9B5]">
              Book a Bornfidis Experience
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Plan a Table Experience That Feels{' '}
              <span className="text-[#C9A84C]">Worth the Moment</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
              Calm execution, Caribbean depth, and premium hospitality — from inquiry to the last plate.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#booking-form"
                className="rounded-full bg-[#C9A84C] px-6 py-3 text-center font-medium text-[#0F3D2E] transition hover:opacity-90"
              >
                Start Your Booking
              </a>
              <a
                href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20booking%20a%20Bornfidis%20chef%20experience."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/30 px-6 py-3 text-center font-medium text-white transition hover:bg-white/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="order-1 w-full max-w-xl justify-self-center lg:order-2 lg:justify-self-end">
            <HomepageBrandImage
              src={bookImages.hero}
              alt="Bornfidis private chef and dining experience"
              priority
              variant="hero"
              fallback={
                <PlaceholderVisual
                  title="Book hero visual"
                  subtitle="Optional: add public/images/book/hero.png and set lib/book-images.ts"
                  className="min-h-[320px] lg:min-h-[380px]"
                />
              }
            />
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <SectionEyebrow>How It Works</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Three calm steps from inquiry to table</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <div
              key={item.step}
              className="rounded-3xl border border-[#E8E1D2] bg-white p-8 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9D7C2F]">{item.step}</p>
              <h3 className="mt-4 text-xl font-semibold text-[#0F3D2E]">{item.title}</h3>
              <p className="mt-4 leading-7 text-[#25483C]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Service selector */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <SectionEyebrow>Choose Your Experience</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Service packages</h2>
            <p className="mt-6 text-lg leading-8 text-[#25483C]">
              Pick the lane that fits your occasion — you can refine details in the booking form.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {servicePackages.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-3xl border border-[#E8E1D2] bg-[#F7F3EA] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <HomepageBrandImage
                  src={homepageImages[item.imageKey]}
                  alt={`Bornfidis — ${item.title}`}
                  variant="section"
                  fallback={
                    <PlaceholderVisual
                      title={item.title}
                      subtitle="Premium service photography"
                      className="h-56"
                    />
                  }
                />
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[#25483C]">{item.description}</p>
                  <a
                    href="#booking-form"
                    className="mt-6 inline-flex rounded-full bg-[#0F3D2E] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
                  >
                    Start here
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Provisions add-on */}
      <section id="provisions" className="scroll-mt-8 bg-[#EDE5D6]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <SectionEyebrow>Provisions add-on</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Bring Bornfidis flavor home</h2>
            <p className="mt-6 text-lg leading-8 text-[#25483C]">
              Pair your booking with small-batch provisions — perfect for gifts, pantries, and future
              gatherings.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {provisionsAddOns.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-[#E8E1D2] bg-white shadow-sm"
              >
                {p.image ? (
                  <div className="relative aspect-[4/5] w-full bg-[#1a2332]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-5 sm:p-6"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9D7C2F]">{p.status}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#0F3D2E]">{p.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#25483C]">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Booking form + 6. Trust strip */}
      <section id="booking-form" className="scroll-mt-8 bg-[#F7F3EA]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <SectionEyebrow>Booking</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Tell us about your event</h2>
            <p className="mt-4 text-lg leading-8 text-[#25483C]">
              We respond within 24 hours with next steps — no spam, no pressure.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-[#E8E1D2] bg-white p-6 shadow-sm md:p-10">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative space-y-8">
              <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                <label htmlFor="website_url">Website URL</label>
                <input
                  type="text"
                  id="website_url"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website_url}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Full name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Phone / WhatsApp <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="eventDate" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Event date <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    required
                    min={minDate}
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="guests" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Guests
                  </label>
                  <input
                    id="guests"
                    name="guests"
                    type="number"
                    min={1}
                    placeholder="e.g. 8"
                    value={formData.guests}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="location" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Location / venue <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="location"
                    name="location"
                    required
                    rows={3}
                    placeholder="Address, villa name, or city — be as specific as you can."
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="experienceType" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Experience type
                  </label>
                  <select
                    id="experienceType"
                    name="experienceType"
                    value={formData.experienceType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {experienceTypes.map((o) => (
                      <option key={o.label} value={o.value} disabled={o.value === ''}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="menuPreference" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Menu preference
                  </label>
                  <select
                    id="menuPreference"
                    name="menuPreference"
                    value={formData.menuPreference}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {menuPreferences.map((o) => (
                      <option key={o.label} value={o.value} disabled={o.value === ''}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="budgetRange" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Budget range
                  </label>
                  <select
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {budgetRanges.map((o) => (
                      <option key={o.label} value={o.value} disabled={o.value === ''}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="mb-1 block text-sm font-medium text-[#25483C]">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    placeholder="Allergies, occasion, vibe, or anything else we should know."
                    value={formData.notes}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D2E] px-6 py-3.5 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-md"
              >
                {isSubmitting && <Spinner size="sm" className="flex-shrink-0 text-white" />}
                {isSubmitting ? 'Submitting…' : 'Submit inquiry'}
              </button>
            </form>

            {/* Trust strip */}
            <div className="mt-10 border-t border-[#E8E1D2] pt-8">
              <p className="text-center text-sm font-semibold uppercase tracking-[0.15em] text-[#9D7C2F]">
                Why hosts trust Bornfidis
              </p>
              <div className="mt-6 grid gap-4 text-center text-sm leading-6 text-[#25483C] sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <span className="text-[#C9A84C]">✦</span>
                  <span>Calm, professional execution</span>
                </div>
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <span className="text-[#C9A84C]">✦</span>
                  <span>Caribbean depth &amp; premium hospitality</span>
                </div>
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <span className="text-[#C9A84C]">✦</span>
                  <span>Clear communication — start to finish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WhatsApp CTA */}
      <section className="bg-[#0F3D2E] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <SectionEyebrow>Prefer WhatsApp?</SectionEyebrow>
          <h2 className="mt-4 text-2xl font-semibold md:text-3xl">Get a fast, personal reply</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/85">
            Share your date, guest count, and location — we&apos;ll help you choose the right experience.
          </p>
          <a
            href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20booking%20a%20Bornfidis%20chef%20experience.%20Here%20are%20my%20details:"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-full bg-[#C9A84C] px-8 py-3.5 font-semibold text-[#0F3D2E] transition hover:opacity-90"
          >
            Chat on WhatsApp
          </a>
          <p className="mt-8 text-sm text-white/65">
            <Link href="/story" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
              Read our story
            </Link>
            {' · '}
            <Link href="/contact" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
              Contact
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
