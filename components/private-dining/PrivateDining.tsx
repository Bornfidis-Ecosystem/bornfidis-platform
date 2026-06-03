'use client'

import Image from 'next/image'

import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { HospitalityCredibility } from '@/components/marketing/HospitalityCredibility'
import { PHASE1_CTA } from '@/lib/phase1-marketing'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { submitBooking } from '@/app/actions'
import { submitWithOfflineFallback } from '@/lib/offline-sync'
import { toast } from '@/components/ui/Toast'

/**
 * Bornfidis — Private Dining page.
 *
 * Integration notes:
 * - Nav + footer are the global PublicNav / PublicFooter (RootShell); this page ships neither.
 *   The forest hero is pulled up under the fixed 72px bar in CSS.
 * - The booking form reuses the EXISTING booking pipeline (submitWithOfflineFallback →
 *   submitBooking → /api/submit-booking → /thanks). No server action or schema is modified;
 *   the design's fields are mapped onto the canonical payload. Phone is required because the
 *   backend schema requires it; the guest range is mapped to a representative count and the
 *   exact range is preserved in the notes.
 * - All visual styling is scoped under `.bf-pd` (components/private-dining/private-dining.css).
 */

const GUEST_OPTIONS: { label: string; count: number }[] = [
  { label: '2–4 guests', count: 4 },
  { label: '5–8 guests', count: 8 },
  { label: '9–12 guests', count: 12 },
  { label: '13–20 guests', count: 20 },
  { label: '20+ guests', count: 25 },
]

const LOCATION_OPTIONS = [
  'Ludlow / Okemo area, Vermont',
  'Woodstock, Vermont',
  'Cavendish / Springfield, Vermont',
  'Stowe, Vermont',
  'Other Vermont location',
  'New Jersey',
  'Jamaica / Caribbean',
  "Other — I'll explain below",
] as const

const OCCASION_OPTIONS = [
  'Anniversary',
  'Birthday',
  'Proposal',
  'Corporate retreat',
  'Family gathering',
  'Wedding rehearsal',
  'Special occasion',
  'Just a beautiful dinner',
] as const

const EXPERIENCE_OPTIONS = [
  'The Gathering — 4-course ($150/person)',
  'The Reserve — 6-course tasting ($220/person)',
  'The Retreat — Group dining 10+ ($130/person)',
  "Not sure yet — let's discuss",
] as const

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  date: '',
  guests: '',
  location: '',
  occasion: '',
  experience: '',
  notes: '',
  website_url: '',
}

export default function PrivateDining() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const stickyRef = useRef<HTMLAnchorElement | null>(null)

  const minDate = new Date().toISOString().split('T')[0]

  // Scroll reveal + sticky CTA visibility.
  useEffect(() => {
    const root = document.querySelector('.bf-pd')
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = root.querySelectorAll<HTMLElement>('.reveal')

    let revealObserver: IntersectionObserver | undefined
    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add('visible'))
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              revealObserver?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
      reveals.forEach((el) => revealObserver?.observe(el))
    }

    const sticky = stickyRef.current
    const hero = root.querySelector('.page-hero')
    const booking = root.querySelector('#book')

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!sticky) return
          if (entry.isIntersecting) sticky.classList.remove('visible')
          else sticky.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    if (hero) heroObserver.observe(hero)

    const bookingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (sticky && entry.isIntersecting) sticky.classList.remove('visible')
        })
      },
      { threshold: 0.2 }
    )
    if (booking) bookingObserver.observe(booking)

    return () => {
      revealObserver?.disconnect()
      heroObserver.disconnect()
      bookingObserver.disconnect()
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const guestOption = GUEST_OPTIONS.find((g) => g.label === form.guests)
    const noteParts = [
      form.notes.trim(),
      form.guests ? `Party size: ${form.guests}` : '',
    ].filter(Boolean)

    const payload = {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      eventDate: form.date,
      location: form.location,
      guestCount: guestOption?.count ?? '',
      guests: guestOption?.count ?? '',
      occasion: form.occasion,
      experienceType: form.experience,
      message: noteParts.join('\n\n'),
      notes: noteParts.join('\n\n'),
      website_url: form.website_url,
    }

    const goThanks = (bookingId?: string) => {
      const q = bookingId
        ? `?type=inquiry&booking_id=${encodeURIComponent(bookingId)}`
        : '?type=inquiry'
      router.push(`/thanks${q}`)
    }

    try {
      const offlineResult = await submitWithOfflineFallback(payload, '/api/submit-booking')
      if (offlineResult.success) {
        toast.success('Your inquiry was sent.')
        goThanks(offlineResult.bookingId)
      } else if (offlineResult.offline) {
        toast.info("Saved offline — we'll send when you're back online.")
        router.push('/thanks?type=inquiry')
      } else {
        setError(offlineResult.error || 'Something went wrong. Please try again.')
        toast.error(offlineResult.error || 'Failed to submit')
      }
    } catch {
      try {
        const result = await submitBooking(payload)
        if (result.success) {
          toast.success('Your inquiry was sent.')
          goThanks((result as { bookingId?: string }).bookingId)
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
          toast.error(result.error || 'Failed to submit')
        }
      } catch {
        setError('An unexpected error occurred. Please try again.')
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bf-pd">
      {/* Sticky CTA */}
      <a ref={stickyRef} href="#book" className="bf-pd-sticky-cta">
        Book Private Dining &darr;
      </a>

      {/* ── Page hero ───────────────────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero-left">
          <div className="breadcrumb">
            <Link href="/">Bornfidis</Link>
            <span>/</span>
            <span className="breadcrumb-current">Private Dining</span>
          </div>
          <h1 className="page-hero-title">
            The table is set.
            <br />
            <em>We come to you.</em>
          </h1>
          <div className="hero-rule" />
          <p className="page-hero-body">
            Bespoke, chef-led private dining in your home, chalet, or Vermont retreat. No fixed
            menus. No performance. A meal made entirely for the people at your table.
          </p>
          <a href="#book" className="btn-primary">
            {PHASE1_CTA.bookPrivateDining.shortLabel}
          </a>
        </div>
        <div className="page-hero-right">
          <Image
            src={bornfidisPhotos.events.servicePlating}
            alt="Chef Brian Maylor plating a course at a Bornfidis private dining event"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="hero-photo-img"
          />
          <div className="hero-photo" aria-hidden />
          <div className="hero-photo-caption">
            <p className="hero-photo-caption-text">
              &ldquo;The best private dining dish is not the one that surprises the guest. It is the
              one that makes them stop talking for a moment.&rdquo;
            </p>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">4–20</div>
                <div className="hero-stat-label">Guests per event</div>
              </div>
              <div>
                <div className="hero-stat-num">$150</div>
                <div className="hero-stat-label">Per person from</div>
              </div>
              <div>
                <div className="hero-stat-num">NJ + VT</div>
                <div className="hero-stat-label">Service areas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience strip ────────────────────────────────── */}
      <div className="experience-strip">
        <div className="exp-item reveal">
          <div className="exp-icon">We bring</div>
          <div className="exp-title">Everything</div>
          <div className="exp-desc">Equipment, ingredients, linens on request. You provide the space.</div>
        </div>
        <div className="exp-item reveal reveal-delay-1">
          <div className="exp-icon">We leave</div>
          <div className="exp-title">A clean kitchen</div>
          <div className="exp-desc">Every surface, every pan. As we found it — or better.</div>
        </div>
        <div className="exp-item reveal reveal-delay-2">
          <div className="exp-icon">You receive</div>
          <div className="exp-title">A custom menu</div>
          <div className="exp-desc">Built around your guests, your occasion, your season.</div>
        </div>
        <div className="exp-item reveal reveal-delay-3">
          <div className="exp-icon">We serve</div>
          <div className="exp-title">Southern VT + NJ</div>
          <div className="exp-desc">And advance bookings in Jamaica and the Caribbean.</div>
        </div>
      </div>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="how-it-works">
        <div className="section-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              The process
            </p>
            <h2 className="section-title reveal reveal-delay-1">
              From inquiry
              <br />
              to the last course.
            </h2>
          </div>
          <p className="section-desc reveal reveal-delay-2">
            You do not need to know what you want when you reach out. That is our job. The inquiry is
            the beginning of a conversation — we figure out the rest together.
          </p>
        </div>
        <div className="process-grid">
          <div className="process-step reveal">
            <span className="step-number">01</span>
            <div className="step-title">You inquire</div>
            <p className="step-desc">
              Fill in the form below — or send a note to hello@bornfidis.com. Tell us the date, the
              occasion, the number of guests. Dietary needs welcome.
            </p>
          </div>
          <div className="process-step reveal reveal-delay-1">
            <span className="step-number">02</span>
            <div className="step-title">We speak</div>
            <p className="step-desc">
              Brian responds within 24 hours to discuss your evening. The call takes 20 minutes. We
              learn what matters to you and what your guests expect.
            </p>
          </div>
          <div className="process-step reveal reveal-delay-2">
            <span className="step-number">03</span>
            <div className="step-title">We design your menu</div>
            <p className="step-desc">
              A week before the event, we send a culinary note — the direction of the menu, the key
              dishes, any questions. This is the most personal part of the process.
            </p>
          </div>
          <div className="process-step reveal reveal-delay-3">
            <span className="step-number">04</span>
            <div className="step-title">We arrive. You sit down.</div>
            <p className="step-desc">
              We arrive 60–90 minutes before your table time. Set up. Cook. Serve. Leave the kitchen
              clean. The only thing left is the memory of the evening.
            </p>
          </div>
        </div>
      </section>

      {/* ── Menu philosophy ─────────────────────────────────── */}
      <section className="menu-philosophy">
        <div className="menu-left">
          <div>
            <p className="label reveal" style={{ color: 'rgba(201,168,76,0.7)', marginBottom: '1.5rem' }}>
              A sample menu
            </p>
            <h2 className="menu-heading reveal reveal-delay-1">
              No two menus
              <br />
              are the <em>same.</em>
            </h2>
          </div>
          <div className="sample-menu reveal reveal-delay-2">
            <div className="sample-menu-label">Autumn Tasting — Vermont</div>
            <div className="menu-course">
              <span className="course-num">I</span>
              <div>
                <div className="course-name">Coconut Ceviche Amuse</div>
                <div className="course-desc">
                  Halibut, tiger&apos;s milk, scotch bonnet oil, lime leaf — three drops only
                </div>
              </div>
            </div>
            <div className="menu-course">
              <span className="course-num">II</span>
              <div>
                <div className="course-name">Roasted Root Bisque</div>
                <div className="course-desc">
                  Vermont parsnip, smoked celeriac, cinnamon cream, allspice oil
                </div>
              </div>
            </div>
            <div className="menu-course">
              <span className="course-num">III</span>
              <div>
                <div className="course-name">Jerk-Spiced Lamb Shoulder</div>
                <div className="course-desc">
                  48-hr jerk rub, coconut braise, root vegetable purée, pickled green papaya
                </div>
              </div>
            </div>
            <div className="menu-course">
              <span className="course-num">IV</span>
              <div>
                <div className="course-name">Guava &amp; Dark Chocolate Torte</div>
                <div className="course-desc">
                  Vermont maple caramel, scotch bonnet finishing oil, Bornfidis smoked salt
                </div>
              </div>
            </div>
            <p className="menu-note">
              This menu is an example only. Yours will be different — built for your guests, your
              season, your occasion.
            </p>
          </div>
        </div>
        <div className="menu-right">
          <p className="label reveal" style={{ marginBottom: '1.5rem' }}>
            What shapes your menu
          </p>
          <h3
            className="section-title reveal reveal-delay-1"
            style={{ marginBottom: '2rem', fontSize: '1.75rem' }}
          >
            Everything comes from somewhere.
          </h3>
          <p className="menu-body reveal reveal-delay-2">
            Bornfidis menus are built from the intersection of two culinary worlds —{' '}
            <strong>the Caribbean</strong>, where allspice, scotch bonnet, and thyme are memory
            before they are ingredients, and <strong>Vermont</strong>, where maple, hardwood smoke,
            and the patience of seasons shape every decision.
          </p>
          <p className="menu-body reveal reveal-delay-2">
            The occasion shapes the pace. A birthday dinner moves differently than a proposal. A
            corporate retreat table has different needs than an intimate anniversary. We read the
            room before we write the menu.
          </p>
          <ul className="menu-detail-list reveal reveal-delay-3">
            <li>Custom menus for every event — no fixed options</li>
            <li>Seasonal Vermont ingredients sourced locally when available</li>
            <li>Caribbean spice provisions made in our own kitchen</li>
            <li>All dietary restrictions accommodated on request</li>
            <li>Wine and beverage pairing guidance available</li>
            <li>Provisions gifting available for guests to take home</li>
          </ul>
        </div>
      </section>

      {/* ── Gallery ─────────────────────────────────────────── */}
      <section className="gallery">
        <div className="gallery-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              The table
            </p>
            <h2 className="gallery-title reveal reveal-delay-1">What your evening looks like.</h2>
          </div>
        </div>
        <div className="gallery-grid">
          <div className="gallery-item large">
            <Image
              src={bornfidisPhotos.events.platesServiceRow}
              alt="A row of plated Bornfidis courses lined up for service at a private event"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="gallery-img"
            />
          </div>
          <div className="gallery-item">
            <Image
              src="/images/bornfidis-table/vermont-table-cabin.jpg"
              alt="A Bornfidis table setting in a Vermont log cabin"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="gallery-img"
            />
          </div>
          <div className="gallery-item">
            <Image
              src={bornfidisPhotos.food.grilledFishOrchid}
              alt="A finished Bornfidis course — grilled fish with an orchid garnish"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="gallery-img"
            />
          </div>
          {/* Jar product photography comes later — forest-green monogram placeholder. */}
          <div className="gallery-item gallery-item-monogram" aria-hidden>
            <span className="gallery-monogram">B</span>
          </div>
          <div className="gallery-item">
            <Image
              src={bornfidisPhotos.food.cremeBrulee}
              alt="Bornfidis crème brûlée dessert course served at a private dining table"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="gallery-img"
            />
          </div>
        </div>
      </section>

      <HospitalityCredibility context="private-dining" className="reveal" />

      {/* ── Occasions ───────────────────────────────────────── */}
      <section className="occasions">
        <div className="section-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              Every occasion
            </p>
            <h2 className="section-title reveal reveal-delay-1">
              The table serves
              <br />
              any gathering.
            </h2>
          </div>
          <p className="section-desc reveal reveal-delay-2">
            We cook for groups of 4 to 20. The occasion determines the pace, the menu, and the
            feeling — not a preset package.
          </p>
        </div>
        <div className="occasions-grid">
          <div className="occasion-card reveal">
            <div className="occasion-name">Intimate Dinners</div>
            <p className="occasion-desc">
              Two to six guests. Anniversaries, proposals, milestone birthdays. The most personal
              occasions deserve the most personal table. We arrive early. We think about every
              detail.
            </p>
          </div>
          <div className="occasion-card reveal reveal-delay-1">
            <div className="occasion-name">Retreat Groups</div>
            <p className="occasion-desc">
              Eight to twenty guests. Corporate retreats, family reunions, friend weekends. The
              communal table. A dinner where the conversation outlasts the food.
            </p>
          </div>
          <div className="occasion-card reveal reveal-delay-2">
            <div className="occasion-name">Special Occasions</div>
            <p className="occasion-desc">
              The occasions that deserve more than a restaurant reservation. A graduation. A
              promotion. A wedding rehearsal dinner. Whatever the reason — the table is ready.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section className="pricing">
        <div className="section-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              Investment
            </p>
            <h2 className="section-title reveal reveal-delay-1">
              Simple, transparent
              <br />
              pricing.
            </h2>
          </div>
          <p className="section-desc reveal reveal-delay-2">
            All pricing is per person. A 30% deposit secures your date. The balance is due 14 days
            before the event. No hidden fees. No service charge on top of the menu price.
          </p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card reveal">
            <div className="pricing-tier">The Gathering</div>
            <div className="pricing-name">Four-Course Dinner</div>
            <div className="pricing-price">
              $150 <span>per person</span>
            </div>
            <p className="pricing-desc">
              A four-course private dining experience. Custom menu. Full service from setup through
              cleanup. Minimum 4 guests.
            </p>
            <ul className="pricing-includes">
              <li>Custom 4-course menu</li>
              <li>All equipment and ingredients</li>
              <li>Full table service</li>
              <li>Complete kitchen cleanup</li>
              <li>Dietary accommodations</li>
            </ul>
            <a href="#book" className="pricing-inquire">
              {PHASE1_CTA.bookPrivateDining.shortLabel} &rarr;
            </a>
          </div>
          <div className="pricing-card featured reveal reveal-delay-1">
            <div className="pricing-tier">The Reserve</div>
            <div className="pricing-name">Six-Course Tasting</div>
            <div className="pricing-price">
              $220 <span>per person</span>
            </div>
            <p className="pricing-desc">
              Our full tasting menu. Six courses, including a palate cleanser and a petit fours
              close. The complete Bornfidis experience.
            </p>
            <ul className="pricing-includes">
              <li>Custom 6-course tasting menu</li>
              <li>Amuse-bouche + mignardises</li>
              <li>Beverage pairing guidance</li>
              <li>Provisions parting gift</li>
              <li>All of The Gathering inclusions</li>
            </ul>
            <a href="#book" className="pricing-inquire">
              {PHASE1_CTA.bookPrivateDining.shortLabel} &rarr;
            </a>
          </div>
          <div className="pricing-card reveal reveal-delay-2">
            <div className="pricing-tier">The Retreat</div>
            <div className="pricing-name">Group Dining (10+)</div>
            <div className="pricing-price">
              $130 <span>per person</span>
            </div>
            <p className="pricing-desc">
              For groups of ten or more. Family-style serving, communal presentation. The long
              table. The meal that becomes the memory of the weekend.
            </p>
            <ul className="pricing-includes">
              <li>Custom communal menu</li>
              <li>Family-style presentation</li>
              <li>Staffing for larger groups</li>
              <li>Full setup and cleanup</li>
              <li>Dietary accommodations</li>
            </ul>
            <a href="#book" className="pricing-inquire">
              {PHASE1_CTA.bookPrivateDining.shortLabel} &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ── Booking form ────────────────────────────────────── */}
      <section className="booking-section" id="book">
        <div className="booking-left">
          <p className="label reveal" style={{ marginBottom: '1.25rem' }}>
            Begin your inquiry
          </p>
          <h2 className="booking-title reveal reveal-delay-1">
            Tell us about
            <br />
            your <em>occasion.</em>
          </h2>
          <p className="booking-body reveal reveal-delay-2">
            You do not need to have everything figured out. Tell us the date, the number of guests,
            and the occasion. We will handle the rest in our first conversation.
          </p>
          <div className="booking-assurances reveal reveal-delay-3">
            <div className="assurance">
              <div className="assurance-dash" />
              <div className="assurance-text">
                <strong>We respond within 24 hours</strong>
                Brian reads every inquiry personally and replies the same day.
              </div>
            </div>
            <div className="assurance">
              <div className="assurance-dash" />
              <div className="assurance-text">
                <strong>No commitment until the deposit</strong>
                The inquiry is a conversation, not a contract.
              </div>
            </div>
            <div className="assurance">
              <div className="assurance-dash" />
              <div className="assurance-text">
                <strong>All dietary needs accommodated</strong>
                Share everything. Nothing is too complex or too specific.
              </div>
            </div>
            <div className="assurance">
              <div className="assurance-dash" />
              <div className="assurance-text">
                <strong>We travel to you</strong>
                Your home, your chalet, your retreat venue. We bring everything.
              </div>
            </div>
          </div>
        </div>

        <div className="booking-form reveal reveal-delay-1">
          <div className="form-title">Request a Private Dining Date</div>
          <div className="form-subtitle">We will be in touch within 24 hours</div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden>
              <label htmlFor="website_url">Website</label>
              <input
                type="text"
                id="website_url"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={form.website_url}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input
                  type="text"
                  id="first-name"
                  name="firstName"
                  placeholder="Your first name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input
                  type="text"
                  id="last-name"
                  name="lastName"
                  placeholder="Your last name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="For a quick follow-up call"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Event Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  min={minDate}
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="guests">Number of Guests</label>
                <select id="guests" name="guests" value={form.guests} onChange={handleChange} required>
                  <option value="" disabled>
                    Select
                  </option>
                  {GUEST_OPTIONS.map((g) => (
                    <option key={g.label} value={g.label}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Event Location</label>
              <select id="location" name="location" value={form.location} onChange={handleChange} required>
                <option value="" disabled>
                  Where are you based?
                </option>
                {LOCATION_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="occasion">The Occasion</label>
              <select id="occasion" name="occasion" value={form.occasion} onChange={handleChange}>
                <option value="" disabled>
                  What are you celebrating?
                </option>
                {OCCASION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience</label>
              <select id="experience" name="experience" value={form.experience} onChange={handleChange}>
                <option value="" disabled>
                  Which experience interests you?
                </option>
                {EXPERIENCE_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Anything else we should know</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Dietary restrictions, allergies, the story behind the occasion, anything that will help us prepare something made for you…"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="form-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send My Inquiry'}
            </button>
            {error ? <p className="form-error">{error}</p> : null}
            <p className="form-note">
              We respond within 24 hours. Your inquiry is not a commitment — it is the beginning of a
              conversation.
            </p>
          </form>
        </div>
      </section>

      <ConversionCtaBand
        compact
        title="Not ready to pick a tier?"
        body="Cooking classes and provision requests go through the same team — we'll guide you to the right experience."
      />
    </div>
  )
}
