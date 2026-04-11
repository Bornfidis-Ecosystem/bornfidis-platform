'use client'

/**
 * BORNFIDIS PROVISIONS — Home v2
 * Contemporary editorial brutalism: marquee, grain, hairline gold, display type.
 */

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

// ── CDN assets ───────────────────────────────────────────────────────────────
const CDN =
  'https://d2xsxph8kpxj0f.cloudfront.net/98733027/UQF9SVcoDu9WUrxocYn2uP'
const LOGO_GOLD = `${CDN}/provisions_logo_gold_58563b10.png`
const ICON_GOLD = `${CDN}/provisions_icon_gold_9f14d9ac.png`

/** Local photography — grill / stovetop line (chicken, sides, sauces). Shared with Story ChefBio. */
const IMG_HERO_KITCHEN = '/images/story/chef-bio-kitchen.png'
const IMG_TABLE_ATM =
  `${CDN}/bf_table_atmosphere-bcEjpnGnjRAmyk6468tLiS.webp`
/** Local — Chef Brian at the grill (chicken). Replaces CDN still where flames read as stove flare, not pan work. */
const IMG_CHEF_GRILL = '/images/story/service-wedding-grill.png'

/** Provisions product photography — `public/images/provisions/*.png` (1200×1200 square). */
const IMG_PROVISION_MAPLE_JERK = '/images/provisions/maple-jerk-rub.png'
const IMG_PROVISION_ISLAND_FIRE = '/images/provisions/island-fire-hot-sauce.png'
const IMG_PROVISION_SMOKED_TAMARIND = '/images/provisions/smoked-tamarind-bbq.png'

const BG = '#080808'
const CREAM = '#F2EDE4'
const GOLD = '#C9A84C'
const SURFACE = '#141414'
const GOLD_DIM = 'rgba(201,168,76,0.18)'

const MARQUEE_TEXT = [
  'BORNFIDIS PROVISIONS',
  'PRIVATE CHEF',
  'VERMONT',
  'CARIBBEAN CUISINE',
  'FARM TO TABLE',
  'INTIMATE DINING',
] as const

const SERVICES = [
  {
    num: '01',
    title: 'Private Dinner',
    sub: 'Intimate Dining Experience',
    desc: 'A curated multi-course dinner prepared in your home, villa, or Airbnb. From amuse-bouche to dessert, every detail is designed around you.',
    price: 'From $650',
    guests: '2–12 guests',
    image: IMG_HERO_KITCHEN,
  },
  {
    num: '02',
    title: 'Weekend Retreat',
    sub: 'Multi-Day Culinary Experience',
    desc: 'Full culinary service for your weekend getaway — breakfast, dinner, and a signature event night. All handled by Chef Brian and Caryll.',
    price: 'From $1,200',
    guests: 'Up to 20 guests',
    image: IMG_TABLE_ATM,
  },
  {
    num: '03',
    title: 'Wedding & Events',
    sub: 'Your Day, Elevated',
    desc: 'Bespoke menus for intimate wedding celebrations. Caribbean, Italian, or fusion — crafted to reflect your story and delight your guests.',
    price: 'Custom quote',
    guests: 'Up to 50 guests',
    image: IMG_CHEF_GRILL,
  },
] as const

const MENU_COURSES = [
  {
    num: 'I',
    name: 'Amuse-Bouche',
    items:
      'Smoked salmon blini · Jerk-spiced crostini, mango chutney',
  },
  {
    num: 'II',
    name: 'First Course',
    items:
      'Roasted beet, goat cheese, candied walnut, citrus vinaigrette',
  },
  {
    num: 'III',
    name: 'Soup',
    items: 'Butternut squash bisque, toasted pepitas, maple cream',
  },
  {
    num: 'IV',
    name: 'Main Course',
    items:
      'Pan-seared duck breast, cherry reduction, root vegetable gratin — or — Herb-crusted rack of lamb, rosemary jus',
  },
  {
    num: 'V',
    name: 'Dessert',
    items:
      'Dark chocolate lava cake, vanilla bean ice cream · Rum-poached pear, almond cream',
  },
] as const

const PROVISIONS = [
  {
    name: 'Maple Jerk Rub',
    desc: 'Vermont maple meets Jamaican jerk. Dry rub for chicken, pork, or vegetables.',
    tag: 'Dry Rub',
    image: IMG_PROVISION_MAPLE_JERK,
    imageAlt: 'Bornfidis Maple Jerk Rub — glass jar with green label on dark stone',
  },
  {
    name: 'Island Fire Hot Sauce',
    desc: 'Scotch bonnet, mango, and tamarind. Heat with purpose.',
    tag: 'Hot Sauce',
    image: IMG_PROVISION_ISLAND_FIRE,
    imageAlt: 'Bornfidis Island Fire hot sauce bottle on volcanic rock',
  },
  {
    name: 'Smoked Tamarind BBQ',
    desc: 'Slow-smoked tamarind base with molasses and allspice. A Caribbean barbecue classic.',
    tag: 'BBQ Sauce',
    image: IMG_PROVISION_SMOKED_TAMARIND,
    imageAlt: 'Bornfidis Smoked Tamarind BBQ sauce jar on charred wood',
  },
] as const

const TESTIMONIALS = [
  {
    quote:
      'Chef Brian turned our weekend retreat into the most memorable dining experience we have ever had. Every course was a conversation starter.',
    name: 'Sarah & James',
    detail: 'Private Retreat, Okemo Valley',
  },
  {
    quote:
      'We asked for Italian with a twist. What we got was a four-day culinary journey that our guests are still talking about.',
    name: 'Fevy & Rian',
    detail: 'Wedding Celebration, Maine',
  },
  {
    quote:
      'Professional, warm, and genuinely talented. Bornfidis Provisions is the kind of service you only find at five-star resorts — brought right to your table.',
    name: 'The Hendersons',
    detail: 'Private Dinner, Ludlow VT',
  },
] as const

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

function MarqueeStrip({
  reverse = false,
  className = '',
}: {
  reverse?: boolean
  className?: string
}) {
  const doubled = [...MARQUEE_TEXT, ...MARQUEE_TEXT]
  return (
    <div
      className={`marquee-track border-y ${className} overflow-hidden`}
      style={{
        borderColor: GOLD_DIM,
        paddingTop: '1.1rem',
        paddingBottom: '1.1rem',
      }}
    >
      <div className={reverse ? 'marquee-inner-reverse' : 'marquee-inner'}>
        {doubled.map((t, i) => (
          <span
            key={`${t}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0,
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
                color: i % 2 === 0 ? GOLD : 'transparent',
                WebkitTextStroke:
                  i % 2 === 0 ? 'none' : `1.5px ${GOLD}`,
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                letterSpacing: '0.08em',
              }}
            >
              {t}
            </span>
            <span style={{ color: GOLD, opacity: 0.4, fontSize: '0.5rem' }}>
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 })
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    setEnabled(mq.matches)
    const h = (e: MediaQueryListEvent) => setEnabled(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const handleMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [enabled, handleMove])

  if (!enabled) return null

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[600px] w-[600px]"
      style={{
        transform: `translate(${pos.x - 300}px, ${pos.y - 300}px)`,
        background:
          'radial-gradient(circle at center, rgba(201,168,76,0.07) 0%, transparent 70%)',
        transition: 'transform 0.08s ease-out',
      }}
      aria-hidden
    />
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-4 flex items-center gap-3"
      style={{
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: GOLD,
      }}
    >
      <span
        className="inline-block h-px w-6 flex-shrink-0"
        style={{ backgroundColor: GOLD }}
      />
      {children}
    </p>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function HomeBornfidisBrutalist() {
  const scrollY = useScrollY()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(0)

  const navScrolled = scrollY > 80

  return (
    <div
      className="home-brutalist-root relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: BG, color: CREAM }}
    >
      <div className="home-brutalist-grain pointer-events-none fixed inset-0 z-[2]" aria-hidden />

      <CursorGlow />

      {/* Nav */}
      <nav
        className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-6 py-5 md:px-10"
        style={{
          transition:
            'background 0.4s ease, padding 0.4s ease, border-bottom 0.4s ease',
          backgroundColor: navScrolled ? 'rgba(8,8,8,0.92)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(12px)' : 'none',
          borderBottom: navScrolled
            ? `1px solid ${GOLD_DIM}`
            : '1px solid transparent',
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 no-underline"
          style={{ textDecoration: 'none' }}
        >
          <Image
            src={ICON_GOLD}
            alt=""
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span
            className="font-display"
            style={{
              fontSize: '1.3rem',
              color: CREAM,
              letterSpacing: '0.1em',
            }}
          >
            BORNFIDIS
          </span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {(['Services', 'Menu', 'Story', 'Provisions'] as const).map(
            (link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="nav-muted uppercase no-underline transition-colors"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  color: 'rgba(242,237,228,0.65)',
                }}
              >
                {link}
              </a>
            ),
          )}
          <a href="#book" className="btn-gold-outline no-underline">
            Book Now
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex flex-col gap-[5px] border-none bg-transparent p-1 md:hidden"
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-label="Menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-[1.5px] w-[22px] transition-all"
              style={{
                backgroundColor: CREAM,
                transform: mobileOpen
                  ? i === 0
                    ? 'translateY(6.5px) rotate(45deg)'
                    : i === 2
                      ? 'translateY(-6.5px) rotate(-45deg)'
                      : 'none'
                  : 'none',
                opacity: mobileOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </nav>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-10"
          style={{ backgroundColor: 'rgba(8,8,8,0.97)' }}
        >
          {(['Services', 'Menu', 'Story', 'Provisions', 'Book'] as const).map(
            (link) => (
              <a
                key={link}
                href={
                  link === 'Book'
                    ? '#book'
                    : `#${link.toLowerCase()}`
                }
                className="font-display no-underline"
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  color: CREAM,
                  letterSpacing: '0.05em',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ),
          )}
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMG_HERO_KITCHEN}
            alt="Jerk-style chicken, sides, and sauces — kitchen line for service"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.1) 40%, rgba(8,8,8,0.85) 80%, rgba(8,8,8,1) 100%)',
            }}
          />
        </div>

        <motion.div
          className="relative z-[2] mx-auto w-full max-w-[1280px] px-6 pb-20 pt-28 md:px-10 md:pb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="mb-6 flex items-center gap-3"
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            <span
              className="inline-block h-px w-8"
              style={{ backgroundColor: GOLD }}
            />
            Private Chef · Vermont
          </motion.p>

          {(['PRIVATE', 'CHEF', 'EXPERIENCES'] as const).map((word, idx) => (
            <div key={word} className="mb-1 overflow-hidden">
              <motion.h1
                variants={fadeUp}
                className={`font-display leading-[0.9] ${word === 'CHEF' ? 'text-stroke-gold' : ''}`}
                style={{
                  fontSize: 'clamp(4rem, 13vw, 12rem)',
                  color: word === 'CHEF' ? 'transparent' : CREAM,
                  letterSpacing: '0.01em',
                }}
              >
                {word}
              </motion.h1>
            </div>
          ))}

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-8"
          >
            <a href="#book" className="btn-gold-outline no-underline">
              Reserve Your Evening
            </a>
            <a
              href="#services"
              className="uppercase no-underline transition-colors hover:text-[#C9A84C]"
              style={{
                fontSize: '0.72rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                color: 'rgba(242,237,228,0.55)',
              }}
            >
              View Services
            </a>
          </motion.div>
        </motion.div>
      </section>

      <MarqueeStrip />
      <MarqueeStrip reverse className="opacity-90" />

      {/* Services */}
      <section id="services" className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <Label>Experiences</Label>
          <h2
            className="font-display mb-16 max-w-3xl"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1 }}
          >
            CRAFTED FOR YOUR TABLE
          </h2>
          <div className="flex flex-col gap-20">
            {SERVICES.map((s) => (
              <motion.div
                key={s.num}
                className="grid items-center gap-10 border-b pb-20 md:grid-cols-2 md:gap-16"
                style={{ borderColor: GOLD_DIM }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-square">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 border"
                    style={{ borderColor: GOLD_DIM }}
                  />
                </div>
                <div>
                  <span
                    className="font-display"
                    style={{ fontSize: '4rem', color: GOLD, opacity: 0.35 }}
                  >
                    {s.num}
                  </span>
                  <h3
                    className="font-display mt-2"
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="font-accent-italic mt-2"
                    style={{ color: GOLD, fontSize: '1rem' }}
                  >
                    {s.sub}
                  </p>
                  <p
                    className="mt-6 leading-relaxed"
                    style={{
                      color: 'rgba(242,237,228,0.75)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {s.desc}
                  </p>
                  <div
                    className="mt-8 flex flex-wrap gap-6"
                    style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}
                  >
                    <span style={{ color: GOLD }}>{s.price}</span>
                    <span style={{ color: 'rgba(242,237,228,0.5)' }}>
                      {s.guests}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section
        id="menu"
        className="border-y px-6 py-24 md:px-10 md:py-32"
        style={{ borderColor: GOLD_DIM, backgroundColor: SURFACE }}
      >
        <div className="mx-auto max-w-[1280px]">
          <Label>Sample progression</Label>
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1 }}
          >
            SIGNATURE MENU
          </h2>
          <div className="flex flex-col gap-4 md:flex-row md:gap-12">
            <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:w-48 md:flex-col">
              {MENU_COURSES.map((c, i) => (
                <button
                  key={c.num}
                  type="button"
                  onClick={() => setActiveMenu(i)}
                  className="whitespace-nowrap border px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor:
                      activeMenu === i ? GOLD : 'rgba(201,168,76,0.2)',
                    backgroundColor:
                      activeMenu === i ? 'rgba(201,168,76,0.08)' : 'transparent',
                    color: activeMenu === i ? CREAM : 'rgba(242,237,228,0.5)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.15em',
                  }}
                >
                  <span style={{ color: GOLD }}>{c.num}</span> {c.name}
                </button>
              ))}
            </div>
            <div className="flex-1 border p-8 md:p-12" style={{ borderColor: GOLD_DIM }}>
              <p
                className="font-display mb-4"
                style={{ fontSize: '2rem', color: GOLD }}
              >
                {MENU_COURSES[activeMenu].num}
              </p>
              <h3
                className="font-display mb-6"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                {MENU_COURSES[activeMenu].name}
              </h3>
              <p
                className="max-w-xl leading-relaxed"
                style={{
                  color: 'rgba(242,237,228,0.8)',
                  fontSize: '1.05rem',
                }}
              >
                {MENU_COURSES[activeMenu].items}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={IMG_CHEF_GRILL}
              alt="Chef Brian grilling chicken on a commercial grill"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div
              className="pointer-events-none absolute inset-0 border"
              style={{ borderColor: GOLD_DIM }}
            />
          </div>
          <div>
            <Label>Our story</Label>
            <h2
              className="font-display mb-8"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05 }}
            >
              FROM WORLD-CLASS KITCHENS TO YOUR HOME
            </h2>
            <p
              className="mb-6 leading-relaxed"
              style={{ color: 'rgba(242,237,228,0.78)', fontSize: '1rem' }}
            >
              Caribbean roots, refined technique, and Vermont hospitality come
              together in every service. We believe the best meals are intimate,
              intentional, and unforgettable.
            </p>
            <Link
              href="/story"
              className="btn-gold-outline inline-block no-underline"
            >
              Read more
            </Link>
          </div>
        </div>
      </section>

      {/* Provisions */}
      <section
        id="provisions"
        className="border-t px-6 py-24 md:px-10 md:py-32"
        style={{ borderColor: GOLD_DIM, backgroundColor: SURFACE }}
      >
        <div className="mx-auto max-w-[1280px]">
          <Label>Provisions</Label>
          <h2
            className="font-display mb-16"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1 }}
          >
            FLAVOR TO TAKE HOME
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {PROVISIONS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col border"
                style={{ borderColor: GOLD_DIM }}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <span
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.2em',
                      color: GOLD,
                    }}
                  >
                    {p.tag}
                  </span>
                  <h3 className="font-display mt-3 text-xl">{p.name}</h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'rgba(242,237,228,0.7)' }}
                  >
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <Label>Voices</Label>
          <h2
            className="font-display mb-16"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', lineHeight: 1 }}
          >
            AT THE TABLE
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <blockquote
                key={i}
                className="border-t pt-8"
                style={{ borderColor: GOLD_DIM }}
              >
                <p
                  className="font-accent-italic mb-6 leading-relaxed"
                  style={{ fontSize: '1.05rem', color: 'rgba(242,237,228,0.88)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer>
                  <cite
                    className="not-italic"
                    style={{ fontWeight: 600, color: CREAM }}
                  >
                    {t.name}
                  </cite>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: 'rgba(242,237,228,0.45)' }}
                  >
                    {t.detail}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Book */}
      <section
        id="book"
        className="border-t px-6 py-24 md:px-10 md:py-32"
        style={{ borderColor: GOLD_DIM, backgroundColor: SURFACE }}
      >
        <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-2">
          <div className="relative min-h-[320px] overflow-hidden lg:min-h-full">
            <Image
              src={IMG_TABLE_ATM}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(8,8,8,0.85) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-[1] flex h-full flex-col justify-end p-8">
              <p
                className="font-display"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1 }}
              >
                RESERVE
                <br />
                YOUR DATE
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <Label>Inquiry</Label>
            <h2
              className="font-display mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1 }}
            >
              LET&apos;S PLAN YOUR EVENING
            </h2>
            <p
              className="mb-8 max-w-md leading-relaxed"
              style={{ color: 'rgba(242,237,228,0.65)', fontSize: '0.95rem' }}
            >
              Share your occasion, guest count, and dates. We&apos;ll follow up
              with a tailored proposal — or book directly through our inquiry
              form.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/book" className="btn-gold-solid no-underline text-center">
                Start booking request
              </Link>
              <Link
                href="/contact"
                className="text-center text-sm uppercase tracking-widest no-underline transition-colors hover:text-[#C9A84C]"
                style={{ color: 'rgba(242,237,228,0.55)' }}
              >
                Contact first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* Footer strip */}
      <footer
        className="flex flex-col items-center justify-between gap-6 border-t px-6 py-10 md:flex-row md:px-10"
        style={{ borderColor: GOLD_DIM }}
      >
        <Image src={LOGO_GOLD} alt="Bornfidis Provisions" width={160} height={48} className="h-10 w-auto opacity-90" />
        <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-widest">
          <Link href="/story" className="no-underline transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(242,237,228,0.5)' }}>
            Story
          </Link>
          <Link href="/book" className="no-underline transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(242,237,228,0.5)' }}>
            Book
          </Link>
          <Link href="/contact" className="no-underline transition-colors hover:text-[#C9A84C]" style={{ color: 'rgba(242,237,228,0.5)' }}>
            Contact
          </Link>
        </div>
      </footer>
    </div>
  )
}
