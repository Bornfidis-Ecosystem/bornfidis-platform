'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { toast } from '@/components/ui/Toast'
import { ConversionCtaBand } from '@/components/marketing/ConversionCtaBand'
import { PHASE1_CTA } from '@/lib/phase1-marketing'

/**
 * Bornfidis — Provisions page.
 *
 * Integration notes:
 * - Nav + footer are the global PublicNav / PublicFooter (RootShell); this page ships neither.
 *   The forest hero is pulled up under the fixed 72px bar in CSS (.bf-prov .page-hero).
 * - There is no commerce/cart backend yet, so "Add to Order" routes to /contact to start an
 *   order inquiry. The community form is a lightweight capture (toast confirmation) matching the
 *   existing ProvisionsEmailCapture stub — wire it to an email platform when ready.
 * - All visual styling is scoped under `.bf-prov` (components/provisions/provisions.css).
 */

type Category = 'spice' | 'marinade' | 'sauce' | 'seasoning'
type Filter = 'all' | Category

type Product = {
  id: string
  category: Category
  wide?: boolean
  featuredImage?: boolean
  badge: { type: 'limited' | 'new' | 'reserve'; text: string }
  categoryLabel: string
  name: string
  desc: string[]
  details: string
  price: string
}

const PRODUCTS: Product[] = [
  {
    id: 'maple-jerk-rub',
    category: 'spice',
    wide: true,
    badge: { type: 'limited', text: 'Request Batch' },
    categoryLabel: 'Dry Spice Rub',
    name: 'Maple Jerk Rub',
    desc: [
      'The provision that started everything. Allspice from Portland Parish, Jamaica — ground fresh from whole berries. Vermont Grade A dark maple sugar, not syrup. Scotch bonnet heat balanced by smoked paprika and cinnamon.',
      'Request your batch — we produce when demand aligns, then deliver. No inventory-first shelves. Use on lamb, chicken, salmon, or pork. Into marinades. As a compound butter base.',
    ],
    details: '4 oz · Hand-mixed · Request → Produce → Deliver',
    price: 'From $18',
  },
  {
    id: 'jerk-marinade',
    category: 'marinade',
    featuredImage: true,
    badge: { type: 'new', text: 'Pre-Order' },
    categoryLabel: 'Wet Marinade',
    name: 'Jerk Marinade',
    desc: [
      'The 48-hour philosophy in a bottle. Scotch bonnet, thyme, allspice, and maple — built for the same patience the Bornfidis kitchen demands at the table.',
      'Pre-order for your next gathering. We batch to order, never to fill a warehouse.',
    ],
    details: '8 oz · 48-hr rested formula · Refrigerate after opening',
    price: 'From $22',
  },
  {
    id: 'sorrel-gastrique',
    category: 'sauce',
    badge: { type: 'limited', text: 'Request Batch' },
    categoryLabel: 'Finishing Sauce',
    name: 'Sorrel Gastrique',
    desc: [
      'Caribbean sorrel reduced with Vermont technique — sweet, tart, and built to finish proteins and roasted vegetables. A bridge between island flavor memory and cold-climate craft.',
      'Limited batches. Join the waitlist or request a jar for your table.',
    ],
    details: '5 oz · Small batch · Request → Produce → Deliver',
    price: 'From $26',
  },
  {
    id: 'green-seasoning',
    category: 'seasoning',
    badge: { type: 'reserve', text: 'Waitlist' },
    categoryLabel: 'Fresh Seasoning',
    name: 'Green Seasoning',
    desc: [
      'Scallion, thyme, scotch bonnet, garlic, and herbs — the Caribbean base that starts every Bornfidis dish. Not a garnish. A foundation.',
      'Fresh batches move quickly. Request yours or join the waiting list for the next production run.',
    ],
    details: '6 oz · Fresh-ground · Best within 21 days refrigerated',
    price: 'From $20',
  },
]

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All Provisions' },
  { id: 'spice', label: 'Spice Rubs' },
  { id: 'marinade', label: 'Marinades' },
  { id: 'sauce', label: 'Finishing' },
  { id: 'seasoning', label: 'Seasonings' },
]

const TRILOGY = [
  {
    num: 'Chapter 01',
    name: 'Maple Jerk Rub',
    role: 'The Foundation',
    desc: 'Season with it. Marinate with it. Use it as the backbone of every dish that carries the Bornfidis signature.',
    delay: '',
  },
  {
    num: 'Chapter 02',
    name: 'Jerk Marinade',
    role: 'The Patience',
    desc: 'Time is the ingredient. The wet marinade carries the 48-hour philosophy into your kitchen before the table is even set.',
    delay: 'reveal-delay-1',
  },
  {
    num: 'Chapter 03',
    name: 'Sorrel Gastrique',
    role: 'The Finish',
    desc: 'Sweet-tart sorrel reduced to a glaze. The last gesture on duck, lamb, or roasted roots.',
    delay: 'reveal-delay-2',
  },
  {
    num: 'Chapter 04',
    name: 'Green Seasoning',
    role: 'The Base',
    desc: 'Herbs, scallion, and scotch bonnet — the Caribbean starting point for soups, stews, and the grill.',
    delay: 'reveal-delay-3',
  },
]

const SOURCING = [
  {
    title: 'Allspice — Portland Parish, Jamaica',
    sub: 'Hand-harvested, sun-dried whole, ground to order',
  },
  {
    title: 'Maple Sugar — Vermont, Grade A Dark',
    sub: 'Third-generation farms, sustainable forestry, hardwood forest',
  },
  {
    title: 'Sea Salt — Atlantic, sustainably harvested',
    sub: 'Solar evaporation, no mechanized harvesting, certified managed',
  },
  {
    title: 'Smoke Wood — Vermont Sugar Maple + Apple',
    sub: 'Dry hardwood, 18-hour cold process, never above 80°F',
  },
  {
    title: 'Scotch Bonnet — Caribbean supplier preferred',
    sub: 'We reduce production rather than substitute and mislabel',
  },
]

const RECIPES = [
  {
    label: 'Maple Jerk Rub',
    name: 'Jerk-Spiced Lamb Shoulder',
    desc: '48-hour dry rub, coconut braise, root vegetable purée. The dish the rub was built for.',
  },
  {
    label: 'Jerk Marinade',
    name: 'Overnight Jerk Chicken',
    desc: 'Marinate two days before service. Grill hot, rest, serve with sorrel gastrique on the side.',
  },
  {
    label: 'Sorrel Gastrique',
    name: 'Duck with Sorrel Glaze',
    desc: 'Reduced sorrel over seared duck breast. Sweet-tart finish that ties Jamaica to the Vermont table.',
  },
  {
    label: 'Green Seasoning',
    name: 'Callaloo & Coconut Soup',
    desc: 'Green seasoning as the base — thyme, scallion, and scotch bonnet before the pot ever hits the fire.',
  },
]

export default function Provisions() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<Filter>('all')

  // Community capture
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  // Product grid filters by category only.
  const productFilter: 'all' | Category = activeFilter

  const visibleCount = useMemo(
    () => (productFilter === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === productFilter).length),
    [productFilter]
  )

  const handleFilter = (id: Filter) => {
    setActiveFilter(id)
  }

  useEffect(() => {
    const root = document.querySelector('.bf-prov')
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    reveals.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setJoining(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success("You're on the list — we'll write when the next batch is ready.")
      setJoined(true)
      setName('')
      setEmail('')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="bf-prov">
      {/* ── Page hero ─────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="hero-bg-word">Provisions</div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="breadcrumb">
              <Link href="/">Bornfidis</Link>
              <span>/</span>
              <span className="breadcrumb-current">Provisions</span>
            </div>
            <h1 className="hero-title">
              Small batch.
              <br />
              <em>No shortcuts.</em>
            </h1>
            <div className="hero-rule" />
            <p className="hero-body">
              Every provision is made by hand in small quantities. Request your batch — we produce
              when demand aligns, then deliver. Request → Produce → Deliver.
            </p>
            <div className="hero-actions">
              <Link href={PHASE1_CTA.requestProduct.href} className="btn-primary">
                {PHASE1_CTA.requestProduct.label}
              </Link>
              <Link href={PHASE1_CTA.bookPrivateDining.href} className="btn-outline">
                {PHASE1_CTA.bookPrivateDining.shortLabel}
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-philosophy">
              <p className="hero-philosophy-text">
                &ldquo;A provisions brand that sources carelessly argues with itself. If the private
                dining table presents food sourced with reverence, and the provision jar tells a
                different story, the guest feels the contradiction even if they cannot name
                it.&rdquo;
              </p>
              <p className="hero-philosophy-attr">Bornfidis — Recipe Bible, Chapter Three</p>
            </div>
            <div className="hero-badges">
              <div className="hero-badge">All Natural</div>
              <div className="hero-badge">No MSG</div>
              <div className="hero-badge">Small Batch</div>
              <div className="hero-badge">Gluten Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter bar ────────────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-tab${activeFilter === f.id ? ' active' : ''}`}
              onClick={() => handleFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="filter-meta">
          {visibleCount} {visibleCount === 1 ? 'provision' : 'provisions'} · Limited quantities
        </span>
      </div>

      {/* ── Products ──────────────────────────────────────────── */}
      <section className="products">
        <div className="products-grid">
          {PRODUCTS.map((p, i) => {
            const hidden = productFilter !== 'all' && p.category !== productFilter
            const delay = i % 3 === 1 ? 'reveal-delay-1' : i % 3 === 2 ? 'reveal-delay-2' : ''
            return (
              <div
                key={p.id}
                className={`product-card reveal ${delay} ${p.wide ? 'wide' : ''}`.trim()}
                data-category={p.category}
                style={hidden ? { display: 'none' } : undefined}
              >
                <div className={`product-image${p.featuredImage ? ' featured' : ''}`}>
                  <div className="product-image-monogram">B</div>
                  <div className={`product-badge ${p.badge.type}`}>{p.badge.text}</div>
                </div>
                <div className="product-info">
                  <div className="product-category">{p.categoryLabel}</div>
                  <div className="product-name">{p.name}</div>
                  <p className="product-desc">
                    {p.desc.map((para, idx) => (
                      <span key={idx}>
                        {para}
                        {idx < p.desc.length - 1 && (
                          <>
                            <br />
                            <br />
                          </>
                        )}
                      </span>
                    ))}
                  </p>
                  <div className="product-details">{p.details}</div>
                  <div className="product-footer">
                    <span className="product-price">{p.price}</span>
                    <button type="button" className="product-add" onClick={() => router.push(PHASE1_CTA.requestProduct.href)}>
                      {PHASE1_CTA.requestProduct.label}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── The trilogy ───────────────────────────────────────── */}
      <section className="trilogy">
        <div className="trilogy-header">
          <div>
            <p className="label reveal" style={{ color: 'rgba(201,168,76,0.7)', marginBottom: '1.25rem' }}>
              The foundation
            </p>
            <h2 className="trilogy-title reveal reveal-delay-1">
              Four provisions.
              <br />
              <em>One complete kitchen.</em>
            </h2>
          </div>
          <p className="trilogy-body reveal reveal-delay-2">
            Maple Jerk Rub, Jerk Marinade, Sorrel Gastrique, and Green Seasoning were designed
            together — each one complete on its own, and more powerful when used alongside the
            others. Request what you need; we batch to order.
          </p>
        </div>
        <div className="trilogy-grid">
          {TRILOGY.map((t) => (
            <div key={t.num} className={`trilogy-card reveal ${t.delay}`.trim()}>
              <div className="trilogy-num">{t.num}</div>
              <div className="trilogy-name">{t.name}</div>
              <div className="trilogy-role">{t.role}</div>
              <p className="trilogy-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interlude ─────────────────────────────────────────── */}
      <div className="interlude">
        <blockquote className="interlude-quote reveal">
          &ldquo;Bornfidis does not make provisions to compete with grocery store shelves. We make
          them as a logical extension of the chef&rsquo;s table — the same philosophy, the same
          standards, the same sourcing discipline, compressed into something you can take
          home.&rdquo;
        </blockquote>
        <div className="interlude-rule reveal reveal-delay-1" />
        <p className="interlude-attr reveal reveal-delay-2">Bornfidis Recipe Bible — Chapter Three</p>
      </div>

      {/* ── Philosophy ────────────────────────────────────────── */}
      <section className="provisions-philosophy">
        <div className="philosophy-content">
          <p className="label reveal" style={{ marginBottom: '1.25rem' }}>
            How we source
          </p>
          <h2 className="philosophy-heading reveal reveal-delay-1">
            Every ingredient
            <br />
            comes from somewhere specific.
          </h2>
          <p className="philosophy-body reveal reveal-delay-2">
            The sourcing section of every provision recipe is not optional reading. It is the
            argument. <strong>The flavor is the evidence.</strong>
          </p>
          <p className="philosophy-body reveal reveal-delay-2">
            Changing the ingredient changes the result. Allspice from Portland Parish, Jamaica
            behaves differently from generic ground allspice. Vermont Grade A dark maple sugar is not
            the same as brown sugar. Scotch bonnet pepper has a fruity, floral quality that habanero
            — its closest substitute — approximates but does not replicate.
          </p>
          <div className="philosophy-rule" />
          <ul className="sourcing-list reveal reveal-delay-3">
            {SOURCING.map((s) => (
              <li key={s.title} className="sourcing-item">
                <div className="sourcing-dash" />
                <div className="sourcing-text">
                  <div className="sourcing-title">{s.title}</div>
                  <div className="sourcing-sub">{s.sub}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-cards reveal reveal-delay-1">
          {RECIPES.map((r) => (
            <div key={r.name} className="recipe-card">
              <div className="recipe-provision" />
              <div>
                <div className="recipe-label">{r.label}</div>
                <div className="recipe-name">{r.name}</div>
                <p className="recipe-desc">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gift sets ─────────────────────────────────────────── */}
      <section className="gift-sets" id="gift-sets">
        <div className="section-header">
          <div>
            <p className="label reveal" style={{ marginBottom: '1rem' }}>
              Give the table
            </p>
            <h2
              className="reveal reveal-delay-1"
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2rem,3vw,2.75rem)',
                fontWeight: 400,
                lineHeight: 1.15,
                color: 'var(--slate)',
              }}
            >
              Provisions as gifts.
            </h2>
          </div>
          <p
            className="reveal reveal-delay-2"
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'var(--muted)',
              marginTop: '1.25rem',
            }}
          >
            Every Bornfidis private dining guest who requests it receives provisions to take home.
            The same jars are available here — the evening, compressed into something you can bring
            to someone&rsquo;s kitchen.
          </p>
        </div>
        <div className="gift-grid">
          <div className="gift-card reveal">
            <div className="gift-name">The Starter Pair</div>
            <div className="gift-sub">Rub and marinade — request as a set</div>
            <ul className="gift-includes">
              <li>Maple Jerk Rub (4 oz)</li>
              <li>Jerk Marinade (8 oz)</li>
              <li>Bornfidis recipe card</li>
              <li>Gift wrapping on request</li>
            </ul>
            <div className="gift-footer">
              <span className="gift-price">From $38</span>
              <button type="button" className="btn-add" onClick={() => router.push(PHASE1_CTA.requestProduct.href)}>
                {PHASE1_CTA.requestProduct.label}
              </button>
            </div>
          </div>
          <div className="gift-card featured reveal reveal-delay-1">
            <div className="gift-name">The Complete Set</div>
            <div className="gift-sub">All four Phase 1 provisions</div>
            <ul className="gift-includes">
              <li>Maple Jerk Rub (4 oz)</li>
              <li>Jerk Marinade (8 oz)</li>
              <li>Sorrel Gastrique (5 oz)</li>
              <li>Green Seasoning (6 oz)</li>
              <li>Full recipe booklet</li>
            </ul>
            <div className="gift-footer">
              <span className="gift-price">From $68</span>
              <button type="button" className="btn-add" onClick={() => router.push(PHASE1_CTA.requestProduct.href)}>
                {PHASE1_CTA.requestProduct.label}
              </button>
            </div>
          </div>
        </div>
      </section>

      <ConversionCtaBand
        title="Need help choosing a provision?"
        body="Tell us what you're cooking for — we'll recommend a batch and confirm availability."
      />

      {/* ── Community / Newsletter ────────────────────────────── */}
      <section className="community">
        <div className="community-left">
          <p className="label reveal" style={{ marginBottom: '1.25rem' }}>
            Join the table
          </p>
          <h2 className="community-title reveal reveal-delay-1">
            First access to every
            <br />
            <em>new batch.</em>
          </h2>
          <p className="community-body reveal reveal-delay-2">
            Bornfidis provisions are made in small quantities. When a batch sells out, it is gone.
            The community list receives notice before any provision goes public — and access to
            batches that never reach the shop.
          </p>
          <ul className="community-perks reveal reveal-delay-3">
            <li>Early access to new provisions — before they open to the public</li>
            <li>Seasonal notes from the kitchen — what we are making and why</li>
            <li>Private dining invitations — events before they open publicly</li>
            <li>Recipe pairings — how to use each provision at home</li>
          </ul>
        </div>

        <div className="email-form reveal reveal-delay-2">
          <div className="email-form-title">Join the Bornfidis Community</div>
          <div className="email-form-sub">Seasonal notes · First access · Private invitations</div>

          {joined ? (
            <p className="form-note" style={{ color: 'var(--gold)', fontStyle: 'normal' }}>
              You&rsquo;re on the list. Watch your inbox for the next batch.
            </p>
          ) : (
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label htmlFor="prov-name">Your Name</label>
                <input
                  type="text"
                  id="prov-name"
                  name="name"
                  placeholder="First and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="prov-email">Email Address</label>
                <input
                  type="email"
                  id="prov-email"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="email-submit" disabled={joining}>
                {joining ? 'Joining…' : 'Join the Community'}
              </button>
              <p className="form-note">
                No frequency commitment. No noise. We write when we have something worth saying.{' '}
                <Link href={PHASE1_CTA.contactBornfidis.href} className="underline">
                  Or contact us directly
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
