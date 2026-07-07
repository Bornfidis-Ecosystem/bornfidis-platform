'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

import { bornfidisPhotos, rcCredibilityGallery } from '@/lib/bornfidis-photos'
import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'

/**
 * Bornfidis — Our Story page.
 *
 * Integration notes:
 * - Nav + footer are the global PublicNav / PublicFooter (RootShell); this page ships neither.
 *   The slate hero is pulled up under the fixed 72px bar in CSS (.bf-story .story-hero).
 * - Hero uses premium kitchen portrait; Royal Caribbean photography lives in `.rc-credibility` only.
 * - All visual styling is scoped under `.bf-story` (components/story/our-story.css).
 */

type Chapter = { id: string; label: string }

// Order matches the on-page section order so the active-tab indicator
// advances monotonically as the reader scrolls.
const CHAPTERS: Chapter[] = [
  { id: 'the-beginning', label: 'The Beginning' },
  { id: 'the-kitchen', label: 'The Kitchen' },
  { id: 'the-crossing', label: 'The Crossing' },
  { id: 'the-table', label: 'The Table' },
  { id: 'the-name', label: 'The Name' },
]

type TimelineEntry = {
  year: string
  role: string
  ship: string
  note: string
  major?: boolean
  delay?: string
}

const TIMELINE: TimelineEntry[] = [
  {
    year: '2006',
    role: 'Culinary Trainee',
    ship: 'Jewel of the Seas · Fort Lauderdale',
    note: 'First contract. The beginning of thirteen years of professional training.',
    major: true,
  },
  {
    year: '2008',
    role: 'Cook-Assistant → Commis-1',
    ship: 'Jewel of the Seas',
    note: 'Formal kitchen certification. Entry into the classical brigade hierarchy.',
    delay: 'reveal-delay-1',
  },
  {
    year: '2009–10',
    role: 'Commis-2',
    ship: 'Navigator of the Seas · Explorer of the Seas',
    note: 'Multiple ships. Multiple contracts. Building galley fluency at volume.',
  },
  {
    year: '2011',
    role: 'Chef de Partie-1',
    ship: 'Freedom of the Seas',
    note: 'Kitchen management. Station leadership on the largest cruise ship in the world at that time. The galley peak.',
    major: true,
    delay: 'reveal-delay-1',
  },
  {
    year: '2012',
    role: 'Cross Training Certificate — Restaurant Operations',
    ship: 'Royal Caribbean Division',
    note: 'Formal cross-training across the complete restaurant operation — the qualification that opened the door to the dining room.',
  },
]

type Value = { num: string; name: string; desc: string; delay?: string }

const VALUES: Value[] = [
  {
    num: '01',
    name: 'Faith',
    desc: 'The table is a sacred place. We treat it as stewardship, not commerce. The food is a gift.',
  },
  {
    num: '02',
    name: 'Service',
    desc: 'True service is invisible. The guest feels only ease — never the effort behind it.',
    delay: 'reveal-delay-1',
  },
  {
    num: '03',
    name: 'Excellence',
    desc: 'Not perfection — excellence. Perfection is about the object. Excellence is about the effort.',
  },
  {
    num: '04',
    name: 'Legacy',
    desc: 'We build for the generation that comes after. The recipes, the relationships — seeds for the next table.',
    delay: 'reveal-delay-1',
  },
]

type Credential = { num: string; sup: string; label: ReactNode; delay?: string }

const CREDENTIALS: Credential[] = [
  {
    num: '13',
    sup: 'yrs',
    label: (
      <>
        Royal Caribbean Group
        <br />
        December 2006 – March 2020
      </>
    ),
  },
  {
    num: '97',
    sup: '.80',
    label: (
      <>
        Guest satisfaction
        <br />
        average score (Azamara)
      </>
    ),
    delay: 'reveal-delay-1',
  },
  {
    num: 'Lv.',
    sup: '5',
    label: (
      <>
        Waiter Lead &amp; Host
        <br />
        certification, August 2016
      </>
    ),
    delay: 'reveal-delay-2',
  },
  {
    num: '10',
    sup: 'yr',
    label: (
      <>
        Service Award
        <br />
        December 16, 2016
      </>
    ),
    delay: 'reveal-delay-3',
  },
]

const SHIPS = [
  'Jewel of the Seas',
  'Navigator of the Seas',
  'Explorer of the Seas',
  'Freedom of the Seas',
  'Independence of the Seas',
  'Harmony of the Seas',
  'Azamara',
]

export default function StoryPage() {
  const [activeChapter, setActiveChapter] = useState<string>(CHAPTERS[0].id)

  useEffect(() => {
    const root = document.querySelector('.bf-story')
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = root.querySelectorAll<HTMLElement>('.reveal')

    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add('visible'))
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              revealObserver.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
      reveals.forEach((el) => revealObserver.observe(el))

      // Scrollspy: a section is "active" while its top sits within a thin band
      // just below the pinned global nav (72px) + chapter bar (~52px). Using a
      // top-anchored band (rather than a visibility ratio) keeps tracking
      // accurate even for sections far taller than the viewport.
      const chapterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id) {
              setActiveChapter(entry.target.id)
            }
          })
        },
        { rootMargin: '-130px 0px -55% 0px', threshold: 0 }
      )
      CHAPTERS.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) chapterObserver.observe(el)
      })

      return () => {
        revealObserver.disconnect()
        chapterObserver.disconnect()
      }
    }
  }, [])

  const scrollToChapter = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bf-story">
      {/* ── Opening hero ───────────────────────────────────────── */}
      <section className="story-hero">
        <div className="hero-left">
          <div className="breadcrumb">
            <Link href="/">Bornfidis</Link>
            <span>/</span>
            <span className="breadcrumb-current">Our Story</span>
          </div>
          <p className="hero-opening">
            He started in the galley. He ended at the head of the table. Thirteen years later, he
            built a table of his own.
          </p>
          <h1 className="hero-title">
            Born for
            <br />
            <em>this.</em>
          </h1>
          <div className="hero-rule" />
          <p className="hero-sub">
            The story of a Jamaican-born chef who spent thirteen years inside the world&rsquo;s
            largest luxury vessels — and what he built when they stopped sailing.
          </p>
        </div>
        <div className="hero-right">
          <Image
            src={bornfidisPhotos.founder.kitchenHero}
            alt="Brian Maylor, founder of Bornfidis, in the kitchen — private chef and culinary director"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="hero-photo-img"
          />
          <div className="hero-photo-area" aria-hidden />
          <div className="hero-credential">
            <div className="hero-credential-name">Brian Bruce Maylor</div>
            <div className="hero-credential-title">Founder &amp; Culinary Director · Bornfidis</div>
            <div className="hero-credential-stats">
              <div>
                <div className="cred-stat-num">13</div>
                <div className="cred-stat-label">Years Royal Caribbean</div>
              </div>
              <div>
                <div className="cred-stat-num">
                  97<span style={{ fontSize: '1rem' }}>.80</span>
                </div>
                <div className="cred-stat-label">Guest score average</div>
              </div>
              <div>
                <div className="cred-stat-num">2</div>
                <div className="cred-stat-label">Countries, one identity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chapter nav ─────────────────────────────────────────── */}
      <nav className="chapter-nav" aria-label="Story chapters">
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chapter-tab ${activeChapter === c.id ? 'active' : ''}`.trim()}
            onClick={() => scrollToChapter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      {/* ── Chapter 01 — The Beginning ──────────────────────────── */}
      <section className="story-opening" id="the-beginning">
        <div className="opening-label-col">
          <div className="opening-chapter-num">01</div>
          <div className="opening-chapter-label">Chapter One</div>
          <div className="opening-chapter-title">The Beginning</div>
        </div>
        <div className="opening-body-col">
          <h2 className="story-h2 reveal">
            December 16, 2006.
            <br />
            Fort Lauderdale.
          </h2>
          <p className="story-body reveal reveal-delay-1">
            Brian Bruce Maylor boarded a Royal Caribbean vessel for the first time on December 16,
            2006, at the Port of Fort Lauderdale. His job title: <strong>Culinary Trainee.</strong>{' '}
            His salary: $655 per contract. His experience: a Jamaican upbringing shaped by food, a
            palate formed in the kitchens of Portland Parish, and a desire to learn the craft from
            the inside.
          </p>
          <p className="story-body reveal reveal-delay-1">
            The shipboard kitchen is one of the most demanding environments in professional
            hospitality. A flagship vessel serves up to 6,000 guests per voyage across multiple
            dining venues, with an F&amp;B team operating under the same brigade system that governs
            Michelin-starred restaurants — except the kitchen never closes, the port changes every
            two days, and the margin for error is zero.
          </p>
          <div className="story-pullquote reveal reveal-delay-2">
            <p>&ldquo;He started at the bottom of that system. And he stayed.&rdquo;</p>
          </div>
          <p className="story-body reveal reveal-delay-2">
            What followed was not a single career move but an education — one that took thirteen
            years and covered every part of the luxury hospitality operation, from the galley deep
            in the ship to the dining room on its top deck.
          </p>
        </div>
      </section>

      {/* ── Chapter 02 — The Kitchen (Timeline) ─────────────────── */}
      <section className="timeline-section" id="the-kitchen">
        <div className="timeline-header">
          <div>
            <p className="label reveal" style={{ color: 'rgba(201,168,76,0.7)', marginBottom: '1.25rem' }}>
              Chapter Two
            </p>
            <h2 className="timeline-title reveal reveal-delay-1">
              The Kitchen Years.
              <br />
              <em>
                Learning to cook
                <br />
                under pressure.
              </em>
            </h2>
          </div>
          <p className="timeline-intro reveal reveal-delay-2">
            The first years were galley years. Culinary Trainee to Cook-Assistant to Commis. The
            brigade system built on the same principles as every great kitchen — but operating at a
            scale, a pace, and a consistency standard that few kitchens on land can match.
          </p>
        </div>

        <div className="timeline-layout">
          <div className="timeline">
            <div className="timeline-line" />
            {TIMELINE.map((entry) => (
              <div key={entry.year} className={`timeline-entry reveal ${entry.delay ?? ''}`.trim()}>
                <div className="timeline-year">{entry.year}</div>
                <div className={`timeline-dot ${entry.major ? 'major' : ''}`.trim()} />
                <div className="timeline-content">
                  <div className="timeline-role">{entry.role}</div>
                  <div className="timeline-ship">{entry.ship}</div>
                  <div className="timeline-note">{entry.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="timeline-photo reveal">
            <Image
              src={bornfidisPhotos.founder.rclWhites2007}
              alt="Brian Maylor in Royal Caribbean chef's whites, 2007 — Bornfidis founder"
              fill
              sizes="(max-width: 1024px) 100vw, 22rem"
              className="timeline-photo-img"
            />
          </div>
        </div>
      </section>

      {/* ── Chapter 03 — The Crossing ───────────────────────────── */}
      <section className="crossing-section" id="the-crossing">
        <div className="crossing-left">
          <p className="label reveal" style={{ marginBottom: '1.5rem' }}>
            Chapter Three
          </p>
          <h2 className="crossing-heading reveal reveal-delay-1">
            2013. The decision most culinary professionals never make.
          </h2>
          <p className="crossing-body reveal reveal-delay-2">
            Brian left the galley. Not because he had failed there — he had reached Chef de
            Partie-1, the kitchen management level — but because he wanted to understand the
            complete hospitality operation.
          </p>
          <p className="crossing-body reveal reveal-delay-2">
            A chef who has never served a table does not fully understand what the table needs. He
            decided to find out. He became a Waiter-Assistant, then a Room Service Attendant, then a
            full Waiter — working his way through the front-of-house the same way he had worked
            through the galley.
          </p>
          <p className="crossing-body reveal reveal-delay-2">
            From both sides of the kitchen door, the education was now complete.
          </p>
        </div>
        <div className="crossing-right">
          <p className="label reveal" style={{ color: 'rgba(201,168,76,0.7)', marginBottom: '1.5rem' }}>
            The front-of-house years
          </p>
          <h2 className="crossing-heading reveal reveal-delay-1">
            From the galley
            <br />
            to the dining room.
            <br />
            <em>Both sides.</em>
          </h2>
          <p className="crossing-body reveal reveal-delay-2">
            By 2016, Brian had achieved <strong>Level 5 Waiter Lead &amp; Host certification</strong>{' '}
            — the highest service classification in Royal Caribbean&rsquo;s F&amp;B structure. In
            December of the same year, he received the <strong>10-Year Service Award.</strong>
          </p>
          <p className="crossing-body reveal reveal-delay-2">
            His guest satisfaction scores on Azamara — the company&rsquo;s luxury tier vessel —
            averaged <strong>97.80.</strong> Performance appraisals across multiple ships
            consistently rated him <strong>Overall 4: Highly Effective.</strong>
          </p>
          <p
            className="crossing-body reveal reveal-delay-2"
            style={{ fontStyle: 'italic', color: 'rgba(250,246,240,0.4)' }}
          >
            &ldquo;He always delivers the WOW to his guests and co-workers.&rdquo; — Royal Caribbean
            Shipboard Appraisal
          </p>
          <div className="crossing-stat reveal reveal-delay-3">
            <div>
              <div className="cstat-num">97.80</div>
              <div className="cstat-label">
                Guest satisfaction
                <br />
                score average
              </div>
            </div>
            <div>
              <div className="cstat-num">Lv.5</div>
              <div className="cstat-label">
                Waiter Lead &amp; Host
                <br />
                certification, 2016
              </div>
            </div>
          </div>
        </div>
        <div className="crossing-break reveal">
          <Image
            src={bornfidisPhotos.founder.romeColosseum}
            alt="Brian Maylor in Rome between European ports — Bornfidis"
            fill
            sizes="100vw"
            className="crossing-break-photo"
          />
        </div>
      </section>

      {/* ── Chapter 04 — The Table (Vermont) ────────────────────── */}
      <section className="vermont-section" id="the-table">
        <div className="vermont-label-col">
          <div className="opening-chapter-num" style={{ color: 'rgba(26,60,52,0.07)' }}>
            04
          </div>
          <div className="opening-chapter-label">Chapter Four</div>
          <div className="opening-chapter-title">When the Ships Stopped. What Came Next.</div>
        </div>
        <div className="opening-body-col">
          <h2 className="story-h2 reveal">
            March 2020.
            <br />
            The industry stopped.
            <br />
            The next chapter began.
          </h2>
          <p className="story-body reveal reveal-delay-1">
            The COVID-19 pandemic brought the global cruise industry to a halt. Royal Caribbean
            cancelled contracts fleet-wide. Brian&rsquo;s final record entry is dated March 29, 2020
            — a cancellation from the <em>Harmony of the Seas.</em>
          </p>
          <p className="story-body reveal reveal-delay-1">
            For many in the shipboard hospitality industry, the pandemic was an ending. For Brian,
            it was a threshold. <strong>Thirteen years of accumulated skill</strong> — galley and
            dining room, kitchen management and guest service, Caribbean ports and European harbors
            — had nowhere to go but forward.
          </p>
          <div className="story-pullquote reveal reveal-delay-2">
            <p>
              &ldquo;Bornfidis began in that gap. Not as a response to loss, but as the activation
              of everything that had been built.&rdquo;
            </p>
          </div>
          <p className="story-body reveal reveal-delay-2">
            He moved between Port Antonio, Jamaica — where the flavor memory lives, where allspice
            and scotch bonnet and thyme had always been more than ingredients — and Cavendish,
            Vermont, where he had come to understand what patience and craft mean in a cold climate.
            Maple sugar. Hardwood smoke. Seasonal discipline.
          </p>
          <p className="story-body reveal reveal-delay-2">
            The two places were not opposites. They were the two sides of a single culinary identity
            — waiting to be brought together.
          </p>
        </div>
      </section>

      {/* ── Chapter 05 — The Name ───────────────────────────────── */}
      <section className="name-section" id="the-name">
        <p className="name-eyebrow reveal">Chapter Five — The Name</p>
        <div className="name-word reveal reveal-delay-1">Bornfidis</div>
        <p className="name-pronunciation reveal reveal-delay-2">born · fih · dis</p>
        <div className="name-rule reveal reveal-delay-2" />
        <p className="name-meaning reveal reveal-delay-3">
          A play on <em>&ldquo;born for this&rdquo;</em> — the belief that every person arrives in
          this world with a specific calling, and that the work of a life is to find it and honor it
          without compromise.
        </p>
        <p className="name-body reveal reveal-delay-3">
          For Brian Maylor, that calling is the table. The brand is both his personal declaration
          and an invitation extended to every person who encounters it. The invitation is this: you
          were born for something too. Bornfidis is what happens when you pursue it without
          compromise.
        </p>
      </section>

      {/* ── Mission / values ────────────────────────────────────── */}
      <section className="mission-section">
        <div className="mission-grid">
          <div className="mission-left">
            <p className="label reveal" style={{ marginBottom: '1.5rem' }}>
              The mission
            </p>
            <div className="mission-statement reveal reveal-delay-1">
              To regenerate people, land, hospitality, and enterprise through intentional culinary
              systems and meaningful experiences.
            </div>
            <p className="mission-body reveal reveal-delay-2">
              The word <em>regenerate</em> is chosen with care. Not grow. Not expand. Not scale.
              Regenerate — to restore vitality to something that has been depleted. The land that
              provides the ingredients. The communities that grow the food. The people who sit at
              the table. The craft of hospitality itself.
            </p>
            <p className="mission-body reveal reveal-delay-2">
              Bornfidis is a regenerative project. Every product made, every dinner served, every
              resource created for food entrepreneurs carries the same intention: to give back more
              than it takes.
            </p>
          </div>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.num} className={`value-box reveal ${v.delay ?? ''}`.trim()}>
                <div className="value-num">{v.num}</div>
                <div className="value-name">{v.name}</div>
                <div className="value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two worlds ──────────────────────────────────────────── */}
      <section className="two-worlds">
        <div className="world-panel vermont">
          <Image
            src={bornfidisPhotos.table.vermontCabin}
            alt="A Bornfidis private dining table set inside a Vermont log cabin"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="world-photo"
          />
          <div className="world-tint vermont-tint" aria-hidden />
          <div className="world-content reveal">
            <p className="label" style={{ marginBottom: '1rem' }}>
              The Vermont hand
            </p>
            <h3 className="world-name">
              Cavendish,
              <br />
              Vermont
            </h3>
            <p className="world-desc">
              Where patience meets a cold climate. Maple sugar that takes forty years before its
              first tap. Hardwood smoke. The discipline of seasons that arrive whether you are ready
              or not.
            </p>
          </div>
          <p className="world-detail reveal">
            Serving: Ludlow · Woodstock · Windsor County · Southern Vermont
          </p>
          <div className="world-bg">VT</div>
        </div>
        <div className="world-panel jamaica">
          <Image
            src={bornfidisPhotos.jamaica.portAntonioBayView}
            alt="Port Antonio, Jamaica — bay view above the town locals recognize"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="world-photo"
          />
          <div className="world-tint jamaica-tint" aria-hidden />
          <div className="world-content reveal">
            <p className="label" style={{ marginBottom: '1rem', color: 'rgba(201,168,76,0.7)' }}>
              The Caribbean heart
            </p>
            <h3 className="world-name">
              Port Antonio,
              <br />
              Jamaica
            </h3>
            <p className="world-desc">
              Portland Parish. Allspice, scotch bonnet, thyme — flavors that do not need
              embellishment, only respect. Where the flavor memory lives. Where Bornfidis Provisions
              is registered and producing.
            </p>
          </div>
          <p className="world-detail reveal">
            Provisions · Yacht Catering · Villa Dining · Advance Booking
          </p>
          <div className="world-bg">JA</div>
        </div>
      </section>

      {/* ── Royal Caribbean credibility (legacy — not hero marketing) ─ */}
      <section className="rc-credibility" aria-labelledby="rc-credibility-heading">
        <div className="rc-credibility-header">
          <p className="label reveal" style={{ color: 'rgba(255, 188, 0, 0.7)', marginBottom: '1.25rem' }}>
            The verified years
          </p>
          <h2 id="rc-credibility-heading" className="rc-credibility-title reveal reveal-delay-1">
            Thirteen years aboard
            <br />
            <em>the world&rsquo;s largest luxury vessels.</em>
          </h2>
          <p className="rc-credibility-body reveal reveal-delay-2">
            These photographs are from the Royal Caribbean years — galley, dining room, and guest
            tables at sea. They document the training behind Bornfidis; they are not the brand we
            sell today. The private dining table is.
          </p>
        </div>
        <div className="rc-credibility-grid">
          {rcCredibilityGallery.map((item, i) => (
            <div
              key={item.src}
              className={`rc-credibility-item reveal${i ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}
            >
              <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="rc-credibility-img" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Credentials ─────────────────────────────────────────── */}
      <section className="credentials">
        <div className="cred-header">
          <div>
            <p className="label reveal" style={{ color: 'rgba(201,168,76,0.7)', marginBottom: '1.25rem' }}>
              The verified record
            </p>
            <h2 className="cred-title reveal reveal-delay-1">
              Not a claim.
              <br />
              <em>A record.</em>
            </h2>
          </div>
          <p className="cred-body reveal reveal-delay-2">
            Royal Caribbean Employee ID 794478. Thirteen years. Seven ships. A Verification of
            Employment document issued by Royal Caribbean Shipboard HR, Miami. The guest satisfaction
            scores are documented, signed, and real.
          </p>
        </div>
        <div className="cred-grid">
          {CREDENTIALS.map((c) => (
            <div key={c.sup} className={`cred-card reveal ${c.delay ?? ''}`.trim()}>
              <div className="cred-number">
                {c.num}
                <sup>{c.sup}</sup>
              </div>
              <div className="cred-label">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="cred-ships">
          {SHIPS.map((ship, i) => (
            <span key={ship} style={{ display: 'contents' }}>
              <span className="ship-name">{ship}</span>
              {i < SHIPS.length - 1 && <span className="ship-divider" />}
            </span>
          ))}
        </div>
      </section>

      <ConversionCtaBand
        variant="forest"
        eyebrow="What comes next"
        title="The table is built. Come sit at it."
        body="Thirteen years of preparation. Two countries. One culinary identity. Book private dining across southern Vermont and New Jersey — or start with provisions and classes."
      />
    </div>
  )
}
