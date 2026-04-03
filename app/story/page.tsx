import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { storyImages } from '@/lib/story-images'

export const metadata: Metadata = {
  title: 'Our Story | Bornfidis',
  description:
    'Rooted in purpose, built through experience — the Bornfidis journey from world-class kitchens to community and the table.',
}

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
    <div className="bg-[#F7F3EA] text-[#0F3D2E]">
      {/* Hero */}
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
              Our Story
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Rooted in Purpose.{' '}
              <span className="text-[#C9A84C]">Built Through Experience.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/85">
              From the kitchens of world-class hospitality to the fields of Jamaica, Bornfidis was built
              on a simple truth —{' '}
              <strong className="font-semibold text-[#E8D9B5]">
                food, service, and community can transform lives.
              </strong>
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/book"
                className="rounded-full bg-[#C9A84C] px-6 py-3 text-center font-medium text-[#0F3D2E] transition hover:opacity-90"
              >
                Book an Experience
              </Link>
              <a
                href="#the-craft"
                className="rounded-full border border-white/30 px-6 py-3 text-center font-medium text-white transition hover:bg-white/10"
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

      {/* 1 — The Craft */}
      <section id="the-craft" className="scroll-mt-8">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <SectionEyebrow>The Craft</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
              A Foundation Built at Sea and Beyond
            </h2>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div className="space-y-6 text-lg leading-8 text-[#25483C]">
              <p>
                Excellence is not an accident. It is built through discipline, repetition, and a
                commitment to doing things the right way — even when no one is watching.
              </p>
              <p>
                For over a decade, my journey has been shaped inside high-performance kitchens serving
                thousands of guests from around the world. From fine dining to large-scale operations,
                every environment demanded the same standard: precision, consistency, and respect for the
                craft.
              </p>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E8E1D2] bg-white p-6 shadow-sm">
                <p className="font-medium text-[#0F3D2E]">Every plate carried responsibility.</p>
                <p className="mt-3 font-medium text-[#0F3D2E]">Every service required focus.</p>
                <p className="mt-3 font-medium text-[#0F3D2E]">Every detail mattered.</p>
              </div>
              <p className="text-lg leading-8 text-[#25483C]">
                That foundation is what Bornfidis stands on today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — The Shift */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <SectionEyebrow>The Shift</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">From Kitchen to Community</h2>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div className="space-y-6 text-lg leading-8 text-[#25483C]">
              <p>
                Over time, the vision grew beyond the plate.
              </p>
              <p>
                True excellence is not only about what we serve — it is about where it comes from, who it
                impacts, and what it creates for the future.
              </p>
              <p className="font-medium text-[#0F3D2E]">
                Bornfidis was created to bridge the gap between skill and opportunity, connecting:
              </p>
              <ul className="list-none space-y-3 border-l-2 border-[#C9A84C]/50 pl-6">
                <li>Farmers to markets</li>
                <li>Food to families</li>
                <li>Craft to community</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-[#E8E1D2] bg-[#F7F3EA] p-8 md:p-10">
              <p className="text-lg leading-8 text-[#25483C]">
                What started as a personal journey in the kitchen has become a mission to build something
                larger — something that feeds not just people, but possibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition — full-width image */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <HomepageBrandImage
            src={storyImages.transition}
            alt="Bornfidis — craft, intention, and the table"
            variant="banner"
            className="w-full shadow-sm"
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
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">The Bornfidis Ecosystem</h2>
          <p className="mt-6 text-lg leading-8 text-[#25483C]">
            Bornfidis is more than a brand. It is a system designed to grow, support, and sustain itself
            across four key pillars:
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {ecosystemCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-[#E8E1D2] bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-[#0F3D2E]">{card.title}</h3>
              <p className="mt-4 leading-7 text-[#25483C]">{card.description}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-center text-lg leading-8 text-[#25483C]">
          Each pillar supports the next — creating a cycle of growth, opportunity, and independence.
        </p>
      </section>

      {/* 4 — Values */}
      <section className="bg-[#EDE5D6]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10">
          <SectionEyebrow>Values</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">What We Stand On</h2>
          <p className="mt-6 text-lg leading-8 text-[#25483C]">
            Bornfidis is guided by principles that do not change with trends:
          </p>
          <ul className="mt-10 space-y-4 text-left text-lg leading-8 text-[#25483C]">
            {values.map((v) => (
              <li key={v.label}>
                <strong className="font-semibold text-[#0F3D2E]">{v.label}</strong> — {v.text}
              </li>
            ))}
          </ul>
          <p className="mt-12 text-lg leading-8 text-[#25483C]">
            We do not chase success.
            <br />
            <span className="font-semibold text-[#0F3D2E]">We build systems that sustain it.</span>
          </p>
        </div>
      </section>

      {/* 5 — Community */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <HomepageBrandImage
            src={storyImages.community}
            alt="Bornfidis — community, partners, and the table"
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
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
              Built With People, Not Just Products
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#25483C]">
              Behind every plate, every product, and every experience is a network of people — chefs,
              farmers, partners, and supporters — working together toward a shared vision.
            </p>
            <p className="mt-4 text-lg leading-8 text-[#25483C]">
              Bornfidis is not built alone.
              <br />
              It is built through collaboration, trust, and a commitment to lifting others as we grow.
            </p>
            <p className="mt-6 text-lg leading-8 text-[#25483C]">
              This is how communities are strengthened.
              <br />
              This is how systems are sustained.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0F3D2E] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10">
          <SectionEyebrow>Ready When You Are</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">Be Part of the Journey</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/85">
            Whether you&apos;re looking for an unforgettable dining experience, quality provisions, or a
            deeper connection to food and community — Bornfidis welcomes you.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/book"
              className="rounded-full bg-[#C9A84C] px-6 py-3 font-medium text-[#0F3D2E] transition hover:opacity-90"
            >
              Book an Experience
            </Link>
            <Link
              href="/book#provisions"
              className="rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Explore Provisions
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Join the Ecosystem
            </Link>
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-6 text-white/70">
            Trusted by guests, partners, and communities across Jamaica and beyond.
          </p>
        </div>
      </section>
    </div>
  )
}
