'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { HospitalityCredibility } from '@/components/marketing/HospitalityCredibility'
import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { BORNFIDIS_DIFFERENCE } from '@/lib/bornfidis-difference'
import { PHASE1_CTA } from '@/lib/phase1-marketing'

/**
 * Bornfidis — editorial homepage ("Caribbean Heart. Vermont Hands.").
 *
 * Integration notes:
 * - Navigation is provided by the single global PublicNav (RootShell) and the footer by the
 *   single global PublicFooter, so this page ships neither. The hero is pulled up under the
 *   fixed 72px bar in CSS.
 * - Marketing slugs (/private-dining, /provisions, /journal, /our-story) are internal platform
 *   routes; booking stays at /book.
 * - All visual styling is scoped under `.bf-home` (components/home/home-editorial.css).
 */

const MARQUEE_ITEMS = [
  'Private Dining',
  'Maple Jerk Rub',
  'Jerk Marinade',
  'Sorrel Gastrique',
  'Green Seasoning',
  'Jamaica × Vermont',
  'Born for This',
  '13 Years Royal Caribbean',
] as const

export default function HomeEditorial() {
  // Scroll-reveal: fade sections in as they enter the viewport.
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.bf-home .reveal')
    if (reveals.length === 0) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    reveals.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bf-home">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Born for this. Made for your table.</p>
          <h1 className="hero-title">
            Caribbean Heart.
            <br />
            <em>Vermont Hands.</em>
          </h1>
          <div className="hero-rule" />
          <p className="hero-body">
            Founded by chef <strong>Brian Maylor</strong> — private dining and small-batch provisions
            rooted in Jamaican culinary tradition and Vermont craft. Thirteen years of luxury
            hospitality. One table at a time.
          </p>
          <div className="hero-actions">
            <Link href={PHASE1_CTA.bookPrivateDining.href} className="btn-primary">
              {PHASE1_CTA.bookPrivateDining.shortLabel}
            </Link>
            <Link href={PHASE1_CTA.requestProduct.href} className="btn-ghost">
              {PHASE1_CTA.requestProduct.label}
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <Image
            src={bornfidisPhotos.founder.kitchenHero}
            alt="Brian Maylor, Private Chef & Founder of Bornfidis, in the kitchen"
            fill
            priority
            className="hero-photo"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="hero-overlay" aria-hidden />
          <div className="hero-caption">
            <p className="hero-caption-text">
              Private dining in your home,
              <br />
              chalet, or Vermont retreat.
            </p>
            <div className="hero-score">
              <div className="hero-score-num">
                97<span>.80</span>
              </div>
              <div className="hero-score-label">Guest Score Average</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────── */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="marquee-item">{item}</span>
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Intro ───────────────────────────────────────────── */}
      <section className="intro">
        <div className="intro-left">
          <p className="label reveal">The story behind the table</p>
          <h2 className="intro-heading reveal reveal-delay-1">
            Every person is
            <br />
            born for something.
          </h2>
          <p className="intro-body reveal reveal-delay-2">
            Bornfidis is a play on <strong>&ldquo;born for this&rdquo;</strong> — the belief that the
            work of a life is to find your calling and honor it without compromise. For Brian Maylor,
            that calling is the table.
          </p>
          <p className="intro-body reveal reveal-delay-2">
            Thirteen years with Royal Caribbean — from Culinary Trainee to Chef de Partie-1, then to
            Lead Waiter on the <em>Harmony of the Seas</em> — produced a chef who understands both
            sides of the kitchen door. The discipline of the galley. The warmth of the dining room.
          </p>
          <p className="intro-body reveal reveal-delay-2">
            Now operating from <strong>Cavendish, Vermont</strong> and{' '}
            <strong>Port Antonio, Jamaica</strong>, Bornfidis brings that thirteen-year education to
            your table. The Caribbean flavor memory. The Vermont seasonal discipline. Both in the
            same jar, the same plate, the same evening.
          </p>
          <Link href="/our-story" className="intro-link reveal reveal-delay-3">
            Read the full story &rarr;
          </Link>
        </div>
        <div className="intro-right">
          <p className="label" style={{ color: 'var(--gold)' }}>
            What we live by
          </p>
          <div className="values-list">
            {[
              {
                num: '01',
                name: 'Faith',
                desc: 'The table is a sacred place. We treat it as stewardship, not commerce.',
              },
              {
                num: '02',
                name: 'Service',
                desc: 'True service is invisible. The guest feels only ease.',
              },
              {
                num: '03',
                name: 'Excellence',
                desc: 'Not perfection — excellence. Every batch, every table, every time.',
              },
              {
                num: '04',
                name: 'Legacy',
                desc: 'We build for the generation that comes after. Seeds for the next table.',
              },
            ].map((v, i) => (
              <div key={v.num} className={`value-item reveal${i ? ` reveal-delay-${i}` : ''}`}>
                <span className="value-num">{v.num}</span>
                <div>
                  <div className="value-name">{v.name}</div>
                  <div className="value-desc">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Bornfidis Difference (story → offer) ─────────── */}
      <section className="difference" aria-labelledby="bornfidis-difference-title">
        <div className="difference-header">
          <p className="label reveal">What makes us different</p>
          <h2 id="bornfidis-difference-title" className="difference-title reveal reveal-delay-1">
            The Bornfidis Difference
          </h2>
          <p className="difference-lead reveal reveal-delay-2">
            Caribbean flavor memory. Vermont seasonal discipline. Luxury-ship training. A table built
            entirely for you — not a preset package.
          </p>
        </div>
        <div className="difference-grid">
          {BORNFIDIS_DIFFERENCE.map((item, i) => (
            <div
              key={item.title}
              className={`difference-card reveal${i ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}
            >
              <span className="difference-num">{item.num}</span>
              <h3 className="difference-name">{item.title}</h3>
              <p className="difference-desc">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="difference-cta reveal reveal-delay-3">
          <Link href={PHASE1_CTA.bookPrivateDining.href} className="difference-cta-primary">
            {PHASE1_CTA.bookPrivateDining.label}
          </Link>
          <span className="difference-cta-divider" aria-hidden>
            ·
          </span>
          <Link href="/our-story" className="difference-cta-link">
            Brian&apos;s full story &rarr;
          </Link>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────── */}
      <section className="services">
        <div className="services-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              What we offer
            </p>
            <h2 className="services-title reveal reveal-delay-1">
              Three ways to sit
              <br />
              at the Bornfidis table.
            </h2>
          </div>
          <p className="services-desc reveal reveal-delay-2">
            Whether you are planning an intimate dinner, stocking your kitchen, or bringing a retreat
            group together — the same philosophy guides everything we make and every table we set.
          </p>
        </div>
        <div className="services-grid">
          <div className="service-card reveal">
            <div className="service-number">01</div>
            <div className="service-name">Private Dining</div>
            <p className="service-desc">
              Bespoke, chef-led dinners in your home, chalet, or Vermont retreat. Entirely custom.
              Seasonal. Built around your guests and your occasion. We arrive, we cook, we serve, we
              leave the kitchen as we found it.
            </p>
            <Link href={PHASE1_CTA.bookPrivateDining.href} className="service-action">
              {PHASE1_CTA.bookPrivateDining.shortLabel} <span className="service-arrow">&rarr;</span>
            </Link>
          </div>
          <div className="service-card reveal reveal-delay-1">
            <div className="service-number">02</div>
            <div className="service-name">Provisions</div>
            <p className="service-desc">
              Small-batch pantry essentials forged at the intersection of Jamaica and Vermont.
              Maple Jerk Rub. Jerk Marinade. Sorrel Gastrique. Green Seasoning. Request your batch
              — we produce when demand aligns.
            </p>
            <Link href={PHASE1_CTA.requestProduct.href} className="service-action">
              {PHASE1_CTA.requestProduct.label} <span className="service-arrow">&rarr;</span>
            </Link>
          </div>
          <div className="service-card reveal reveal-delay-2">
            <div className="service-number">03</div>
            <div className="service-name">Cooking Classes</div>
            <p className="service-desc">
              Hands-on sessions rooted in Caribbean technique and Vermont craft. Learn the marinades,
              the rubs, and the table philosophy behind every Bornfidis dinner — in your kitchen or ours.
            </p>
            <Link href={PHASE1_CTA.bookCookingClass.href} className="service-action">
              {PHASE1_CTA.bookCookingClass.label} <span className="service-arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Provisions showcase ─────────────────────────────── */}
      <section className="provisions">
        <div className="provisions-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              From the pantry
            </p>
            <h2 className="provisions-title reveal reveal-delay-1">
              Small batch.
              <br />
              No shortcuts.
            </h2>
          </div>
          <Link href="/provisions" className="provisions-link reveal reveal-delay-2">
            View all provisions &rarr;
          </Link>
        </div>
        <div className="provisions-grid">
          <div className="provision-card reveal">
            <div className="provision-tag">Dry Spice Rub · Request Batch</div>
            <div className="provision-name">Maple Jerk Rub</div>
            <p className="provision-desc">
              Jamaican allspice and scotch bonnet. Vermont maple sugar. The flavor that started it
              all — hand-mixed, batch to order.
            </p>
            <div className="provision-footer">
              <span className="provision-price">From $18</span>
              <span className="provision-stock">4 oz · Request</span>
            </div>
          </div>
          <div className="provision-card reveal reveal-delay-1">
            <div className="provision-tag">Wet Marinade · Pre-Order</div>
            <div className="provision-name">Jerk Marinade</div>
            <p className="provision-desc">
              The 48-hour philosophy in a bottle. Scotch bonnet, thyme, and maple — built for the
              same patience the Bornfidis kitchen demands.
            </p>
            <div className="provision-footer">
              <span className="provision-price">From $22</span>
              <span className="provision-stock">8 oz · Pre-order</span>
            </div>
          </div>
          <div className="provision-card reveal reveal-delay-2">
            <div className="provision-tag">Finishing Sauce · Request Batch</div>
            <div className="provision-name">Sorrel Gastrique</div>
            <p className="provision-desc">
              Caribbean sorrel reduced with Vermont technique. Sweet-tart glaze for proteins and
              roasted vegetables.
            </p>
            <div className="provision-footer">
              <span className="provision-price">From $26</span>
              <span className="provision-stock">5 oz · Request</span>
            </div>
          </div>
          <div className="provision-card reveal reveal-delay-3">
            <div className="provision-tag">Fresh Seasoning · Waitlist</div>
            <div className="provision-name">Green Seasoning</div>
            <p className="provision-desc">
              Scallion, thyme, scotch bonnet, and herbs — the Caribbean base that starts every
              Bornfidis dish.
            </p>
            <div className="provision-footer">
              <span className="provision-price">From $20</span>
              <span className="provision-stock">6 oz · Waitlist</span>
            </div>
          </div>
        </div>
      </section>

      <HospitalityCredibility context="home" className="reveal" />

      {/* ── Philosophy ──────────────────────────────────────── */}
      <section className="philosophy">
        <div className="philosophy-label">
          <div className="philosophy-rule" />
          <p className="label" style={{ color: 'rgba(201,168,76,0.7)' }}>
            The philosophy
          </p>
        </div>
        <div className="reveal">
          <blockquote className="philosophy-quote">
            &ldquo;I am not building a business. I am building a table large enough for the
            generations that come after me to sit at.{' '}
            <em>Everything I make today is a place setting for that future.</em>&rdquo;
          </blockquote>
          <p className="philosophy-attribution">Brian Maylor — Founder, Bornfidis</p>
        </div>
      </section>

      {/* ── Locations ───────────────────────────────────────── */}
      <section className="locations">
        <div className="location-panel vermont">
          <Image
            src={bornfidisPhotos.table.vermontCabin}
            alt="A Bornfidis private dining table set inside a Vermont log cabin"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="location-photo"
          />
          <div className="location-tint vermont-tint" aria-hidden />
          <div className="location-content reveal">
            <p className="label" style={{ marginBottom: '1rem' }}>
              The Vermont hand
            </p>
            <h3 className="location-name">
              Cavendish,
              <br />
              Vermont
            </h3>
            <p className="location-desc">
              Where patience and craft meet a cold climate. Maple sugar, hardwood smoke, and the
              discipline of seasons that arrive whether you are ready or not.
            </p>
          </div>
          <p className="location-detail reveal">
            Serving: Ludlow · Woodstock · Windsor County · Southern Vermont
          </p>
          <div className="location-bg-text">VT</div>
        </div>
        <div className="location-panel jamaica">
          <Image
            src={bornfidisPhotos.jamaica.clarendonMist}
            alt="Misty green hills above Port Antonio, Jamaica — the Caribbean roots of Bornfidis"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="location-photo"
          />
          <div className="location-tint jamaica-tint" aria-hidden />
          <div className="location-content reveal">
            <p className="label" style={{ marginBottom: '1rem', color: 'rgba(201,168,76,0.7)' }}>
              The Caribbean heart
            </p>
            <h3 className="location-name">
              Port Antonio,
              <br />
              Jamaica
            </h3>
            <p className="location-desc">
              Portland Parish. Allspice, scotch bonnet, thyme — flavors that do not need
              embellishment, only respect. Where the flavor memory lives.
            </p>
          </div>
          <p className="location-detail reveal">
            Provisions · Yacht Catering · Villa Dining · Advance Booking
          </p>
          <div className="location-bg-text">JA</div>
        </div>
      </section>

      <ConversionCtaBand
        variant="forest"
        eyebrow="The table is ready"
        title="Your table is waiting. Let's begin."
        body="Private dining from $150 per person. We come to you. We bring everything. You sit down."
        className="reveal"
      />
    </div>
  )
}
