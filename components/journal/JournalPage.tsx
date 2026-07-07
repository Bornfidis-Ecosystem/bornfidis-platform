'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { bornfidisPhotos } from '@/lib/bornfidis-photos'
import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { PHASE1_CTA, PHASE1_PRIMARY_PRODUCTS } from '@/lib/phase1-marketing'
import { PROVISIONS_FLAGSHIP_PRODUCTS } from '@/lib/provisions-products'

/**
 * Bornfidis — Journal (editorial / newspaper layout).
 *
 * Integration notes:
 * - Nav + footer are the global PublicNav / PublicFooter (RootShell); this page ships neither.
 * - The category bar is `position: sticky` under the global 72px nav (works site-wide now that
 *   globals.css uses `overflow-x: clip` rather than `hidden`).
 * - Filtering is state-driven (no inline handlers). Items without a category (mini cards, sidebar)
 *   are always shown, matching the source design.
 * - All visual styling is scoped under `.bf-journal` (components/journal/journal.css).
 * - Image areas are styled placeholders until brand photography is supplied.
 */

type CategoryId =
  | 'all'
  | 'kitchen'
  | 'provisions'
  | 'sourcing'
  | 'table'
  | 'vermont'
  | 'jamaica'

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'kitchen', label: 'From the Kitchen' },
  { id: 'provisions', label: 'Provisions' },
  { id: 'sourcing', label: 'Sourcing' },
  { id: 'table', label: 'The Table' },
  { id: 'vermont', label: 'Vermont' },
  { id: 'jamaica', label: 'Jamaica' },
]

type Post = {
  category: Exclude<CategoryId, 'all'>
  imageClass?: 'green' | 'light-bg'
  imageTag: string
  /** When set, real photography replaces the placeholder tile. */
  src?: string
  alt?: string
  /** Forest-green monogram placeholder (provisions jar photography comes later). */
  useMonogram?: boolean
  label: string
  title: string
  excerpt: string
  date: string
  delay?: string
}

const POSTS: Post[] = [
  {
    category: 'provisions',
    imageClass: 'green',
    imageTag: 'Maple Jerk Rub',
    src: '/images/provisions/maple-jerk-rub-hero.jpg',
    alt: 'Maple Jerk Rub — Bornfidis Provisions test batch',
    label: 'Provisions',
    title: 'Small Batch No. 01 Is Ready. What That Means and What Comes Next.',
    excerpt:
      'The first production run of Maple Jerk Rub is complete. Hand-mixed in limited runs — each jar labeled with the batch date. Here is what is in it, where everything came from, and when the next batch will be made.',
    date: 'October 2025',
  },
  {
    category: 'sourcing',
    imageClass: 'light-bg',
    imageTag: 'Replace with Vermont farm photography',
    src: bornfidisPhotos.food.seasonalSalad,
    alt: 'Seasonal salad with watermelon radish, berries, and goat cheese — Bornfidis Vermont sourcing',
    label: 'Sourcing',
    title: 'The Sugar Maple That Takes Forty Years Before Its First Tap.',
    excerpt:
      'Vermont maple sugar is not grown. It is inherited. A sugar maple tree takes four decades before it can be tapped. The farms we work with are not producing a crop — they are stewarding a forest. This is what that means for the flavor in every jar.',
    date: 'September 2025',
    delay: 'reveal-delay-1',
  },
  {
    category: 'table',
    imageTag: 'Replace with table photography',
    src: bornfidisPhotos.food.grilledFishOrchid,
    alt: 'A finished Bornfidis course — grilled fish with an orchid garnish, plated for service',
    label: 'The Table',
    title: 'The Silence at the Table. What It Means When a Guest Stops Talking.',
    excerpt:
      'The highest compliment a cook can receive is not applause. It is the moment a guest lifts their fork, takes a bite, and goes quiet. This is what we are working toward every time. And it is rarer than it sounds.',
    date: 'August 2025',
  },
  {
    category: 'jamaica',
    imageClass: 'green',
    imageTag: 'Port Antonio',
    src: bornfidisPhotos.jamaica.portAntonioMarina,
    alt: 'Port Antonio harbour — yachts and hills above the marina',
    label: 'Jamaica',
    title: 'Why Scotch Bonnet Is Not About the Heat. A Defense of the Most Misunderstood Pepper.',
    excerpt:
      'There is a persistent misunderstanding about Caribbean food and heat. The assumption is that the scotch bonnet is there to make food hot. This is wrong. The scotch bonnet is one of the most complex chile peppers in the world. This is the argument.',
    date: 'July 2025',
    delay: 'reveal-delay-1',
  },
  {
    category: 'vermont',
    imageClass: 'light-bg',
    imageTag: 'Replace with Vermont winter photography',
    src: bornfidisPhotos.table.vermontCabin,
    alt: 'A Bornfidis private dining table set inside a Vermont log cabin',
    label: 'Vermont',
    title: 'Cold-Smoking Salt in a Vermont Winter. Notes on 18 Hours and What Patience Tastes Like.',
    excerpt:
      'The smoke chamber must stay below 80°F throughout. In January in Cavendish, this is easy. The cold is an ingredient. This is a record of one batch of Vermont Smoked Sea Salt, from the wood selection to the first pinch on a plate.',
    date: 'January 2025',
  },
]

const JOURNAL_PROVISIONS = PROVISIONS_FLAGSHIP_PRODUCTS.map((product) => {
  const nav = PHASE1_PRIMARY_PRODUCTS.find((p) => p.id === product.id)
  return {
    name: product.name,
    meta: `${product.priceFrom} · ${product.size} · ${product.status}`,
    href: nav?.href ?? `/provisions#${product.id}`,
    image: product.imageHero,
  }
})

const MOST_READ = [
  { num: '01', title: 'The 48-Hour Marinade. Why Time Is the Most Important Ingredient.', cat: 'From the Kitchen' },
  { num: '02', title: 'Why Scotch Bonnet Is Not About the Heat.', cat: 'Jamaica' },
  { num: '03', title: 'The Sugar Maple That Takes Forty Years.', cat: 'Sourcing · Vermont' },
  { num: '04', title: 'Cold-Smoking Salt in a Vermont Winter.', cat: 'Vermont · Provisions' },
]

const MINI_CARDS = [
  {
    imageClass: '',
    src: bornfidisPhotos.food.guestPlatedChicken,
    alt: 'Bornfidis private dining — a guest course plated with herbs and sauce',
    category: 'The Table',
    title: 'What a Private Dining Guest Actually Wants. And What They Are Afraid to Ask For.',
    date: 'December 2025',
  },
  {
    imageClass: 'slate',
    src: bornfidisPhotos.jamaica.portAntonioPier,
    alt: 'Port Antonio, Jamaica — wooden pier over the harbour',
    category: 'Jamaica',
    title: 'Port Antonio Is Not a Destination. It Is a Kitchen with a View.',
    date: 'October 2025',
    delay: 'reveal-delay-1',
  },
  {
    imageClass: 'light',
    src: bornfidisPhotos.food.oystersOnIce,
    alt: 'Freshly shucked oysters on ice with dipping sauces, sourced for a Bornfidis menu',
    category: 'Sourcing',
    title: 'Why We Reduce Production Rather Than Substitute and Mislabel.',
    date: 'September 2025',
    delay: 'reveal-delay-2',
  },
]

const ARCHIVE_CATS = [
  'From the Kitchen',
  'Provisions',
  'Sourcing',
  'The Table',
  'Vermont',
  'Jamaica',
  'Private Dining',
  'Recipe Notes',
] as const

function journalNextStepHref(category: Post['category']): string {
  if (category === 'provisions') return PHASE1_CTA.requestProduct.href
  if (category === 'table' || category === 'kitchen') return PHASE1_CTA.bookPrivateDining.href
  return PHASE1_CTA.contactBornfidis.href
}

function journalNextStepLabel(category: Post['category']): string {
  if (category === 'provisions') return 'Request a product'
  if (category === 'table' || category === 'kitchen') return 'Book private dining'
  return 'Start an inquiry'
}

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const didMount = useRef(false)

  // Scroll-reveal animation (runs once on mount).
  useEffect(() => {
    const root = document.querySelector('.bf-journal')
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = root.querySelectorAll<HTMLElement>('.reveal')

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
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    reveals.forEach((el) => observer.observe(el))

    // Fallback: never leave cards at opacity 0 if observer misses (slow layout, mobile, etc.)
    const fallback = window.setTimeout(() => {
      root.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach((el) => {
        if (getComputedStyle(el).display !== 'none') el.classList.add('visible')
      })
    }, 900)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  // After a filter change, make sure anything now shown is fully revealed
  // (a card filtered back into view should never stay stuck at opacity 0).
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    const root = document.querySelector('.bf-journal')
    if (!root) return
    root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      if (getComputedStyle(el).display !== 'none') el.classList.add('visible')
    })
  }, [activeCategory])

  const isHidden = (category: Exclude<CategoryId, 'all'>) =>
    activeCategory !== 'all' && activeCategory !== category

  return (
    <div className="bf-journal">
      {/* ── Masthead ─────────────────────────────────────────── */}
      <div className="journal-hero">
        <div className="journal-header">
          <div className="journal-meta-left">
            Cavendish, Vermont &middot; Port Antonio, Jamaica
            <br />
            Est. 2022 &middot; Published seasonally
          </div>
          <div className="journal-wordmark">The Journal</div>
          <div className="journal-meta-right">
            Notes from the kitchen
            <br />
            bornfidis.com/journal
          </div>
        </div>
        <div className="journal-tagline-row">
          <span className="journal-tagline">
            Seasonal notes, sourcing stories, and dispatches from the Bornfidis table.
          </span>
          <span className="journal-issue">Volume I &middot; Autumn 2025</span>
        </div>
      </div>

      {/* ── Category filter ────────────────────────────────────── */}
      <div className="category-bar" role="tablist" aria-label="Filter journal by category">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === c.id}
            className={`cat-btn ${activeCategory === c.id ? 'active' : ''}`.trim()}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Featured article ───────────────────────────────────── */}
      <article className="featured-post" style={{ display: isHidden('kitchen') ? 'none' : undefined }}>
        <div className="featured-image">
          <Image
            src={bornfidisPhotos.events.platesServiceRow}
            alt="A row of plated Bornfidis courses lined up and ready for service"
            fill
            priority
            sizes="(max-width: 980px) 100vw, 60vw"
            className="featured-photo"
          />
        </div>
        <div className="featured-content">
          <div>
            <div className="featured-kicker">From the Kitchen &middot; Featured</div>
            <h2 className="featured-title">
              The 48-Hour Marinade. Why Time Is the Most Important Ingredient in This Kitchen.
            </h2>
            <p className="featured-excerpt">
              Most jerk preparations marinate for four hours. Some for overnight. The Bornfidis
              kitchen starts the clock two days before service — and the difference is not
              incremental. It is categorical. This is the argument for patience as a cooking
              technique, not a personality trait.
            </p>
          </div>
          <div className="featured-footer">
            <span className="article-date">November 2025</span>
            <Link href={PHASE1_CTA.bookPrivateDining.href} className="read-link">
              {PHASE1_CTA.bookPrivateDining.shortLabel}{' '}
              <span className="read-link-arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </article>

      {/* ── Main content grid ──────────────────────────────────── */}
      <div className="journal-grid">
        <div className="posts-column">
          {POSTS.map((p) => (
            <article
              key={p.title}
              className={`post-card reveal ${p.delay ?? ''}`.trim()}
              style={{ display: isHidden(p.category) ? 'none' : undefined }}
            >
              <div className={`post-image ${p.imageClass ?? ''}`.trim()}>
                {p.src ? (
                  <Image
                    src={p.src}
                    alt={p.alt ?? ''}
                    fill
                    sizes="(max-width: 980px) 100vw, 40vw"
                    className="post-photo"
                  />
                ) : p.useMonogram ? (
                  <span className="post-image-monogram" aria-hidden>
                    B
                  </span>
                ) : (
                  <div className="post-image-tag">{p.imageTag}</div>
                )}
              </div>
              <div className="post-content">
                <div>
                  <div className="post-category">{p.label}</div>
                  <h3 className="post-title">{p.title}</h3>
                  <p className="post-excerpt">{p.excerpt}</p>
                </div>
                <div className="post-footer">
                  <span className="article-date">{p.date}</span>
                  <Link href={journalNextStepHref(p.category)} className="read-link">
                    {journalNextStepLabel(p.category)}{' '}
                    <span className="read-link-arrow">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <span className="sidebar-label">From the provisions</span>
            {JOURNAL_PROVISIONS.map((pr) => (
              <Link key={pr.name} href={pr.href} className="sidebar-provision sidebar-provision--linked">
                <div className="sidebar-provision-swatch sidebar-provision-swatch--photo">
                  <Image src={pr.image} alt="" fill sizes="48px" className="sidebar-provision-photo" />
                </div>
                <div>
                  <div className="sidebar-provision-name">{pr.name}</div>
                  <div className="sidebar-provision-price">{pr.meta}</div>
                </div>
              </Link>
            ))}
            <Link href={PHASE1_CTA.requestProduct.href} className="sidebar-link">
              {PHASE1_CTA.requestProduct.label} &rarr;
            </Link>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Most read</span>
            {MOST_READ.map((r) => (
              <div key={r.num} className="reading-item">
                <div className="reading-num">{r.num}</div>
                <div className="reading-title">{r.title}</div>
                <div className="reading-category">{r.cat}</div>
              </div>
            ))}
          </div>

          <div className="booking-sidebar">
            <span className="sidebar-label">Private dining</span>
            <div className="booking-sidebar-title">The table is ready when you are.</div>
            <p className="booking-sidebar-body">
              Private dining from $150 per person. We come to you. Vermont and New Jersey.
            </p>
            <Link href={PHASE1_CTA.bookPrivateDining.href} className="btn-sidebar">
              {PHASE1_CTA.bookPrivateDining.shortLabel}
            </Link>
            <Link href={PHASE1_CTA.bookCookingClass.href} className="sidebar-link" style={{ marginTop: '0.75rem', display: 'block' }}>
              {PHASE1_CTA.bookCookingClass.label} &rarr;
            </Link>
          </div>

          <div className="sidebar-section newsletter-sidebar">
            <span className="sidebar-label">Notes from the kitchen</span>
            <p className="newsletter-intro">
              The Journal arrives by email before it publishes here. Seasonal notes. First access to
              new batches.
            </p>
            <Link href={PHASE1_CTA.contactBornfidis.href} className="btn-sidebar" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
              {PHASE1_CTA.contactBornfidis.label}
            </Link>
            <p className="newsletter-note">
              Prefer email updates later? Start with an inquiry — we&apos;ll add you when batches open.
            </p>
          </div>
        </aside>
      </div>

      {/* ── Long read preview ──────────────────────────────────── */}
      <div className="long-read reveal" style={{ display: isHidden('kitchen') ? 'none' : undefined }}>
        <div className="long-read-meta">
          <span className="long-read-badge">Long Read</span>
          <span className="long-read-label" style={{ marginTop: '1.5rem' }}>
            From the Kitchen
          </span>
          <div className="long-read-num">—</div>
          <div className="long-read-title">
            The 48-Hour Marinade. Why Time Is the Most Important Ingredient in This Kitchen.
          </div>
          <div className="long-read-date" style={{ marginTop: '0.75rem' }}>
            November 2025 &middot; 8 min read
          </div>
        </div>
        <div className="long-read-content">
          <h3 className="long-read-heading">
            Most people think of a marinade as something that adds flavor. It does — but that is not
            the most important thing it does.
          </h3>
          <p className="long-read-body">
            The first thing a marinade does is create a surface. The <em>Maple Jerk Blend</em>{' '}
            contains maple sugar — a complex carbohydrate that, given enough time in contact with the
            fat and protein of a lamb shoulder, begins to draw moisture from the meat outward while
            simultaneously penetrating the outer muscle fibers with the aromatic compounds in the
            allspice, scotch bonnet, and thyme.
          </p>
          <p className="long-read-body">
            At four hours, you have surface flavor. At overnight, you have penetration into the first
            centimeter of the meat. At <strong>48 hours</strong>, something different has happened.
            The maple sugar has caramelized slightly at the surface — not from heat, but from
            enzymatic activity and the interaction with the salt in the blend. The scotch
            bonnet&rsquo;s capsaicin has moved deeper into the muscle. And the allspice, which is the
            most volatile of the twelve ingredients, has had enough time to settle rather than
            announce itself.
          </p>
          <div className="long-read-pullquote">
            <p>
              &ldquo;Patience is a culinary technique. It changes the chemistry of the food. It is
              not a personality trait or a marketing story — it is the reason the lamb tastes the way
              it does.&rdquo;
            </p>
          </div>
          <p className="long-read-body">
            When the shoulder goes into a hot oven after 48 hours, the crust sets within the first
            twenty minutes and does not release its flavor into the braising liquid. It stays on the
            meat. That is the structural result of patience. Not a subtle one. A categorical one.
          </p>
          <div className="long-read-footer">
            <span className="article-date">November 2025</span>
            <Link href={PHASE1_CTA.bookPrivateDining.href} className="read-link">
              {PHASE1_CTA.bookPrivateDining.shortLabel}{' '}
              <span className="read-link-arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── More posts ─────────────────────────────────────────── */}
      <section className="more-posts">
        <div className="more-posts-header">
          <h2 className="more-posts-title">More from the journal</h2>
          <Link href={PHASE1_CTA.contactBornfidis.href} className="more-posts-link">
            {PHASE1_CTA.contactBornfidis.label} &rarr;
          </Link>
        </div>
        <div className="more-grid">
          {MINI_CARDS.map((m) => (
            <article key={m.title} className={`mini-card reveal ${m.delay ?? ''}`.trim()}>
              <div className={`mini-card-image ${m.imageClass}`.trim()}>
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 980px) 100vw, 30vw"
                  className="mini-photo"
                />
              </div>
              <div className="mini-category">{m.category}</div>
              <div className="mini-title">{m.title}</div>
              <div className="mini-date">{m.date}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Archive / categories ───────────────────────────────── */}
      <div className="archive-strip">
        <div className="archive-left">
          <div className="archive-title">Browse by topic</div>
          <div className="archive-sub">
            Every entry in the Bornfidis Journal, organized by what it is about.
          </div>
        </div>
        <div className="archive-categories">
          {ARCHIVE_CATS.map((c) => (
            <Link key={c} href={PHASE1_CTA.contactBornfidis.href} className="archive-cat">
              {c}
            </Link>
          ))}
        </div>
      </div>

      <ConversionCtaBand
        compact
        title="Inspired by what you read?"
        body="Private dining, provisions, and cooking classes all start with a conversation."
      />
    </div>
  )
}
