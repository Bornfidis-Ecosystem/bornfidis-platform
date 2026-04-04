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
import { cdnImages } from '@/lib/bornfidis-cdn-images'
import BrutalistBookingNav from '@/components/layout/BrutalistBookingNav'

const BG = '#080808'
const SURFACE = '#141414'
const GOLD_DIM = 'rgba(201,168,76,0.22)'

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">
      <span className="inline-block h-px w-6 flex-shrink-0 bg-[#C9A84C]" />
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
      className={`relative min-h-[220px] overflow-hidden border border-[rgba(201,168,76,0.25)] bg-gradient-to-br from-[#141414] to-[#0f0f0f] ${className}`}
    >
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(201,168,76,0.15)_0%,transparent_45%)]" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-6">
        <p className="font-display text-lg text-[#F2EDE4]">{title}</p>
        {subtitle ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-[rgba(242,237,228,0.55)]">
            {subtitle}
          </p>
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
      const offlineResult = await submitWithOfflineFallback(
        payload,
        '/api/submit-booking',
      )

      if (offlineResult.success) {
        toast.success('Booking submitted successfully!')
        router.push('/thanks')
      } else if (offlineResult.offline) {
        toast.info(
          "Your booking has been saved offline and will be submitted when you're back online.",
        )
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const inputClass =
    'w-full rounded-sm border border-[rgba(201,168,76,0.28)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-[0.9rem] font-light text-[#F2EDE4] placeholder:text-[rgba(242,237,228,0.35)] focus:border-[#C9A84C]/60 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30'

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="relative min-h-screen text-[#F2EDE4]" style={{ backgroundColor: BG }}>
      <BrutalistBookingNav />

      {/* Hero */}
      <section className="relative isolate min-h-[min(100vh,920px)] overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <Image
            src={bookImages.hero}
            alt=""
            fill
            priority
            className="object-cover object-[center_30%]"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0.35) 45%, rgba(8,8,8,0.92) 100%)',
            }}
          />
        </div>

        <div className="relative z-[1] mx-auto max-w-7xl px-6 pb-24 pt-12 md:px-10 md:pb-28 md:pt-16">
          <p className="mb-4 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#C9A84C]">
            <span className="inline-block h-px w-8 bg-[#C9A84C]" />
            Book a Bornfidis experience
          </p>
          <h1 className="font-display text-[clamp(2.75rem,9vw,5.75rem)] leading-[0.92] tracking-tight text-[#F2EDE4]">
            PLAN A TABLE
            <br />
            <span className="text-[#C9A84C]">WORTH THE MOMENT</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[rgba(242,237,228,0.78)] md:text-lg">
            Calm execution, Caribbean depth, and premium hospitality — from
            inquiry to the last plate.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="#booking-form" className="btn-gold-solid no-underline">
              Start your booking
            </a>
            <a
              href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20booking%20a%20Bornfidis%20chef%20experience."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold-outline text-center no-underline"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t px-6 py-20 md:px-10 md:py-28" style={{ borderColor: GOLD_DIM }}>
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight text-[#F2EDE4]">
            THREE CALM STEPS
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="border p-8"
                style={{
                  borderColor: GOLD_DIM,
                  backgroundColor: SURFACE,
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
                  {item.step}
                </p>
                <h3 className="mt-4 font-display text-xl text-[#F2EDE4]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[rgba(242,237,228,0.7)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service packages */}
      <section
        className="border-t px-6 py-20 md:px-10 md:py-28"
        style={{ borderColor: GOLD_DIM, backgroundColor: SURFACE }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>Choose your experience</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] text-[#F2EDE4]">
            SERVICE PACKAGES
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[rgba(242,237,228,0.65)]">
            Pick the lane that fits your occasion — refine details in the booking
            form.
          </p>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {servicePackages.map((item) => (
              <div
                key={item.title}
                className="flex flex-col overflow-hidden border transition-transform hover:-translate-y-0.5"
                style={{ borderColor: GOLD_DIM, backgroundColor: BG }}
              >
                <HomepageBrandImage
                  src={homepageImages[item.imageKey]}
                  alt={`Bornfidis — ${item.title}`}
                  variant="section"
                  className="!border-0 rounded-none"
                  fallback={
                    <PlaceholderVisual
                      title={item.title}
                      subtitle="Photography via CDN"
                      className="h-56"
                    />
                  }
                />
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <h3 className="font-display text-xl text-[#F2EDE4]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[rgba(242,237,228,0.68)]">
                    {item.description}
                  </p>
                  <a
                    href="#booking-form"
                    className="btn-gold-outline mt-6 inline-flex w-fit no-underline"
                  >
                    Start here
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provisions add-on */}
      <section
        id="provisions"
        className="scroll-mt-24 border-t px-6 py-20 md:px-10 md:py-28"
        style={{ borderColor: GOLD_DIM }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>Provisions add-on</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] text-[#F2EDE4]">
            BRING FLAVOR HOME
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[rgba(242,237,228,0.65)]">
            Pair your booking with small-batch provisions — gifts, pantries, and
            future gatherings.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {provisionsAddOns.map((p, i) => {
              const provisionShots = [
                cdnImages.sauceProduct,
                cdnImages.heroPlating,
                cdnImages.tableAtmosphere,
              ] as const
              const imgSrc =
                p.image?.startsWith('http://') || p.image?.startsWith('https://')
                  ? p.image
                  : provisionShots[i % provisionShots.length]
              return (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden border"
                  style={{ borderColor: GOLD_DIM, backgroundColor: SURFACE }}
                >
                  <div className="relative aspect-[4/5] w-full bg-[#0a0a0a]">
                    <Image
                      src={imgSrc}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
                      {p.status}
                    </p>
                    <h3 className="mt-2 font-display text-lg text-[#F2EDE4]">
                      {p.name}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[rgba(242,237,228,0.65)]">
                      {p.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section
        id="booking-form"
        className="scroll-mt-24 border-t px-6 py-20 md:px-10 md:py-28"
        style={{ borderColor: GOLD_DIM, backgroundColor: SURFACE }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>Booking</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] text-[#F2EDE4]">
            TELL US ABOUT YOUR EVENT
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[rgba(242,237,228,0.65)]">
            We respond within 24 hours with next steps — no spam, no pressure.
          </p>

          <div
            className="mt-12 border p-6 md:p-10"
            style={{ borderColor: GOLD_DIM, backgroundColor: BG }}
          >
            {error ? (
              <div className="mb-6 border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

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
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
                    Full name <span className="text-red-400">*</span>
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
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
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
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
                    Phone / WhatsApp <span className="text-red-400">*</span>
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
                  <label
                    htmlFor="eventDate"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
                    Event date <span className="text-red-400">*</span>
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
                  <label
                    htmlFor="guests"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
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
                  <label
                    htmlFor="location"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
                    Location / venue <span className="text-red-400">*</span>
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
                  <label
                    htmlFor="experienceType"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
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
                      <option
                        key={o.label}
                        value={o.value}
                        disabled={o.value === ''}
                        className="bg-[#141414] text-[#F2EDE4]"
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="menuPreference"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
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
                      <option
                        key={o.label}
                        value={o.value}
                        disabled={o.value === ''}
                        className="bg-[#141414] text-[#F2EDE4]"
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="budgetRange"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
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
                      <option
                        key={o.label}
                        value={o.value}
                        disabled={o.value === ''}
                        className="bg-[#141414] text-[#F2EDE4]"
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium text-[rgba(242,237,228,0.75)]"
                  >
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
                className="btn-gold-solid inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-md"
              >
                {isSubmitting ? (
                  <Spinner size="sm" className="flex-shrink-0 text-[#080808]" />
                ) : null}
                {isSubmitting ? 'Submitting…' : 'Submit inquiry'}
              </button>
            </form>

            <div
              className="mt-12 border-t pt-10"
              style={{ borderColor: GOLD_DIM }}
            >
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
                Why hosts trust Bornfidis
              </p>
              <div className="mt-8 grid gap-6 text-center text-sm text-[rgba(242,237,228,0.65)] sm:grid-cols-3">
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

      {/* WhatsApp CTA */}
      <section
        className="border-t px-6 py-20 text-center md:px-10 md:py-24"
        style={{ borderColor: GOLD_DIM, backgroundColor: BG }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>Prefer WhatsApp?</SectionEyebrow>
          <h2 className="font-display text-2xl text-[#F2EDE4] md:text-3xl">
            GET A FAST, PERSONAL REPLY
          </h2>
          <p className="mx-auto mt-6 text-base leading-relaxed text-[rgba(242,237,228,0.7)]">
            Share your date, guest count, and location — we&apos;ll help you
            choose the right experience.
          </p>
          <a
            href="https://wa.me/18027335348?text=Hi%20Brian,%20I%E2%80%99m%20interested%20in%20booking%20a%20Bornfidis%20chef%20experience.%20Here%20are%20my%20details:"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold-solid mt-10 inline-flex no-underline"
          >
            Chat on WhatsApp
          </a>
          <p className="mt-10 text-sm text-[rgba(242,237,228,0.45)]">
            <Link
              href="/story"
              className="underline decoration-[rgba(201,168,76,0.4)] underline-offset-4 hover:decoration-[#C9A84C]"
            >
              Our story
            </Link>
            {' · '}
            <Link
              href="/contact"
              className="underline decoration-[rgba(201,168,76,0.4)] underline-offset-4 hover:decoration-[#C9A84C]"
            >
              Contact
            </Link>
            {' · '}
            <Link
              href="/"
              className="underline decoration-[rgba(201,168,76,0.4)] underline-offset-4 hover:decoration-[#C9A84C]"
            >
              Home
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
