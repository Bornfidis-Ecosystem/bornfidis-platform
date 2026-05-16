import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { ChefBio } from '@/components/story/ChefBio'
import { brandPhotos } from '@/lib/brand-photos'
import { storyImages } from '@/lib/story-images'

export const metadata: Metadata = {
  title: 'Our Story | Bornfidis',
  description:
    'Rooted in purpose, built through experience — the Bornfidis journey from world-class kitchens to community and the table.',
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{children}</p>
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
      className={`relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-cream/90 to-stone-200/40 ${className}`}
    >
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,rgba(200,150,62,0.2)_0,transparent_40%),radial-gradient(circle_at_bottom_right,rgba(46,107,79,0.12)_0,transparent_35%)]" />
      <div className="relative flex h-full min-h-[220px] flex-col justify-end p-6">
        <p className="text-lg font-semibold text-midnight">{title}</p>
        {subtitle ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-forestDark/85">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

const ecosystemCards = [
  {
    title: 'Food — Provisions & Experiences',
    description:
      'Private chef services, curated dining, and small-batch products rooted in Caribbean excellence.',
  },
  {
    title: 'Clothing — Sportswear',
    description:
      'Performance-driven apparel designed for movement, identity, and lifestyle.',
  },
  {
    title: 'Housing — Future Vision',
    description:
      'Sustainable living solutions focused on community development and long-term impact.',
  },
  {
    title: 'Education — Academy',
    description:
      'Digital tools, field guides, and knowledge systems to empower individuals and entrepreneurs.',
  },
]

const values = [
  { label: 'Faith', text: 'Trusting the journey and staying grounded in purpose' },
  { label: 'Integrity', text: 'Doing what is right, even when it is difficult' },
  { label: 'Excellence', text: 'Delivering quality without compromise' },
  { label: 'Innovation', text: 'Building forward with intention and creativity' },
  { label: 'Sustainability', text: 'Thinking long-term in every decision' },
  { label: 'Service', text: 'Putting people at the center of what we do' },
  { label: 'Legacy', text: 'Creating something that outlives us' },
]

export default function StoryPage() {
  return (
    <div className="bg-gradient-to-b from-cream/25 via-stone-50 to-cream/35 text-forestDark">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-midnight text-cream">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={brandPhotos.jamaicaStream}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-midnight/93 via-forestDark/78 to-midnight/90" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_80%_at_20%_0%,rgba(200,150,62,0.12)_0%,transparent_45%),radial-gradient(ellipse_90%_60%_at_100%_100%,rgba(46,107,79,0.18)_0%,transparent_50%)]" />
        <div className="home-brutalist-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay" aria-hidden />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_48%,transparent_100%)] opacity-60" />

        <div className="relative z-[2] flex justify-end px-6 pt-5 md:px-10">
          <Link href="/" className="text-sm font-medium text-brass/95 transition hover:text-cream">
            ← Home
          </Link>
        </div>

        <div className="relative z-[2] mx-auto grid max-w-7xl gap-12 px-6 pb-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28">
          <div className="order-2 max-w-3xl lg:order-1">
            <p className="mb-5 inline-flex items-center rounded-full border border-gold/35 bg-midnight/30 px-4 py-1.5 text-sm tracking-wide text-brass backdrop-blur-md">
              Our Story
            </p>
            <h1 className="font-display text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-cream md:text-5xl lg:text-[3.25rem]">
              Rooted in Purpose.{' '}
              <span className="text-gold">Built Through Experience.</span>
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-cream/88">
              From the kitchens of world-class hospitality to the fields of Jamaica, Bornfidis was built on a simple
              truth —{' '}
              <strong className="font-semibold text-brass">food, service, and community can transform lives.</strong>
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/book"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-center text-sm font-semibold text-midnight shadow-lg shadow-black/30 transition hover:bg-brass"
              >
                Book an Experience
              </Link>
              <a
                href="#the-craft"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-cream/35 bg-white/[0.06] px-8 py-3.5 text-center text-sm font-medium text-cream backdrop-blur-sm transition hover:bg-white/12"
              >
                Read the Story
              </a>
            </div>
          </div>

          <div className="order-1 w-full max-w-xl justify-self-center lg:order-2 lg:justify-self-end">
            <HomepageBrandImage
              src={storyImages.hero}
              alt="Chef Brian in professional whites — craft, discipline, and the kitchen"
              priority
              variant="hero"
              fallback={
                <PlaceholderVisual
                  title="Story hero visual"
                  subtitle="Add public/images/story/hero.png — hero image: chef / composed shot"
                  className="min-h-[360px]"
                />
              }
            />
          </div>
        </div>
      </section>

      <ChefBio />

      {/* 1 — The Craft */}
      <section id="the-craft" className="scroll-mt-8">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <SectionEyebrow>The Craft</SectionEyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
              A Foundation Built at Sea and Beyond
            </h2>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div className="space-y-6 text-lg leading-relaxed text-forestDark/88">
              <p>
                Excellence is not an accident. It is built through discipline, repetition, and a commitment to doing
                things the right way — even when no one is watching.
              </p>
              <p>
                For over a decade, my journey has been shaped inside high-performance kitchens serving thousands of
                guests from around the world. From fine dining to large-scale operations, every environment demanded the
                same standard: precision, consistency, and respect for the craft.
              </p>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-gold/15 bg-white/90 p-6 shadow-[0_8px_40px_-12px_rgba(13,31,45,0.08)] backdrop-blur-[2px]">
                <p className="font-medium text-midnight">Every plate carried responsibility.</p>
                <p className="mt-3 font-medium text-midnight">Every service required focus.</p>
                <p className="mt-3 font-medium text-midnight">Every detail mattered.</p>
              </div>
              <p className="text-lg leading-relaxed text-forestDark/88">That foundation is what Bornfidis stands on today.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — The Shift */}
      <section className="bg-white/80">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <SectionEyebrow>The Shift</SectionEyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
              From Kitchen to Community
            </h2>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div className="space-y-6 text-lg leading-relaxed text-forestDark/88">
              <p>Over time, the vision grew beyond the plate.</p>
              <p>
                True excellence is not only about what we serve — it is about where it comes from, who it impacts, and
                what it creates for the future.
              </p>
              <p className="font-medium text-midnight">
                Bornfidis was created to bridge the gap between skill and opportunity, connecting:
              </p>
              <ul className="list-none space-y-3 border-l-2 border-gold/40 pl-6">
                <li>Farmers to markets</li>
                <li>Food to families</li>
                <li>Craft to community</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-gold/10 bg-cream/25 p-8 shadow-inner shadow-midnight/[0.04] md:p-10">
              <p className="text-lg leading-relaxed text-forestDark/88">
                What started as a personal journey in the kitchen has become a mission to build something larger —
                something that feeds not just people, but possibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition — full-width image */}
      <section className="border-y border-gold/10 bg-stone-50/80">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <HomepageBrandImage
            src={storyImages.transition}
            alt="Jamaican land and water — regenerative growth at the source"
            variant="banner"
            className="w-full shadow-lg shadow-midnight/10"
            fallback={
              <PlaceholderVisual
                title="Transition moment"
                subtitle="Full-width visual — add public/images/story/transition.png"
                className="min-h-[280px] w-full"
              />
            }
          />
        </div>
      </section>

      {/* 3 — The Ecosystem */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="max-w-3xl">
          <SectionEyebrow>The Ecosystem</SectionEyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
            The Bornfidis Ecosystem
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-forestDark/88">
            Bornfidis is more than a brand. It is a system designed to grow, support, and sustain itself across four key
            pillars:
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {ecosystemCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-gold/10 bg-white/90 p-8 shadow-[0_12px_48px_-16px_rgba(13,31,45,0.1)] backdrop-blur-[2px] transition hover:border-gold/25 hover:shadow-[0_16px_56px_-16px_rgba(13,31,45,0.14)]"
            >
              <h3 className="text-xl font-semibold text-midnight">{card.title}</h3>
              <p className="mt-4 leading-relaxed text-forestDark/85">{card.description}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-center text-lg leading-relaxed text-forestDark/85">
          Each pillar supports the next — creating a cycle of growth, opportunity, and independence.
        </p>
      </section>

      {/* 4 — Values */}
      <section className="border-y border-gold/10 bg-gradient-to-b from-cream/30 to-stone-100/80">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10">
          <SectionEyebrow>Values</SectionEyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
            What We Stand On
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-forestDark/88">
            Bornfidis is guided by principles that do not change with trends:
          </p>
          <ul className="mt-10 space-y-4 text-left text-lg leading-relaxed text-forestDark/88">
            {values.map((v) => (
              <li key={v.label}>
                <strong className="font-semibold text-midnight">{v.label}</strong> — {v.text}
              </li>
            ))}
          </ul>
          <p className="mt-12 text-lg leading-relaxed text-forestDark/88">
            We do not chase success.
            <br />
            <span className="font-semibold text-midnight">We build systems that sustain it.</span>
          </p>
        </div>
      </section>

      {/* 5 — Community */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <HomepageBrandImage
            src={storyImages.community}
            alt="Farmers and harvest — people behind Bornfidis provisions"
            variant="section"
            className="min-h-[280px] w-full"
            fallback={
              <PlaceholderVisual
                title="Community"
                subtitle="Add public/images/story/community.png"
                className="min-h-[380px]"
              />
            }
          />
          <div>
            <SectionEyebrow>Community</SectionEyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
              Built With People, Not Just Products
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forestDark/88">
              Behind every plate, every product, and every experience is a network of people — chefs, farmers, partners,
              and supporters — working together toward a shared vision.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-forestDark/88">
              Bornfidis is not built alone.
              <br />
              It is built through collaboration, trust, and a commitment to lifting others as we grow.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-forestDark/88">
              This is how communities are strengthened.
              <br />
              This is how systems are sustained.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gold/10 bg-midnight text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 md:py-24">
          <SectionEyebrow>Ready When You Are</SectionEyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-cream md:text-5xl">
            Be Part of the Journey
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-cream/85">
            Whether you&apos;re looking for an unforgettable dining experience, quality provisions, or a deeper connection
            to food and community — Bornfidis welcomes you.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/book"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-midnight shadow-lg transition hover:bg-brass"
            >
              Book an Experience
            </Link>
            <Link
              href="/book#provisions"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-cream/35 px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-white/10"
            >
              Explore Provisions
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-cream/35 px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-white/10"
            >
              Join the Ecosystem
            </Link>
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-relaxed text-cream/70">
            Trusted by guests, partners, and communities across Jamaica and beyond.
          </p>
        </div>
      </section>
    </div>
  )
}
