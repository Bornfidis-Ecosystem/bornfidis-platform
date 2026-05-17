'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  bookBody,
  bookEyebrow,
  bookHeadline,
  bookSection,
} from '@/components/booking/book-culinary-classes'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { BrandedCard } from '@/components/ui/BrandedCard'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { marketingImages } from '@/lib/marketing-images'

const IMG_HERO = marketingImages.cateringHammeredLine
const IMG_PHILOSOPHY = marketingImages.diningMenuDetail
const IMG_STORY = '/images/story/service-wedding-grill.png'

const SERVICES = [
  {
    title: 'Private Dinner',
    desc: 'A curated multi-course dinner in your home, villa, or retreat — from amuse-bouche to dessert.',
    price: 'From $650',
    href: '/book',
  },
  {
    title: 'Weekend Retreat',
    desc: 'Full culinary service for your getaway — breakfast, dinner, and a signature event night.',
    price: 'From $1,200',
    href: '/book',
  },
  {
    title: 'Wedding & Events',
    desc: 'Bespoke menus for intimate celebrations — Caribbean, Italian, or fusion crafted for your story.',
    price: 'Custom quote',
    href: '/contact',
  },
] as const

const SAMPLE_MENU = [
  {
    name: 'Jerk-Spiced Venison Carpaccio',
    desc: 'Thinly sliced venison, pickled shallot, micro herbs, citrus oil',
  },
  {
    name: 'Roasted Beet & Goat Cheese',
    desc: 'Candied walnut, citrus vinaigrette, edible flowers',
  },
  {
    name: 'Butternut Squash Bisque',
    desc: 'Toasted pepitas, maple cream, warm spice',
  },
  {
    name: 'Herb-Crusted Rack of Lamb',
    desc: 'Rosemary jus, root vegetable gratin, seasonal greens',
  },
  {
    name: 'Dark Chocolate Lava Cake',
    desc: 'Vanilla bean ice cream, rum-poached pear',
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
      'Professional, warm, and genuinely talented. Bornfidis brings five-star resort service — right to your table.',
    name: 'Michael T.',
    detail: 'Private Villa, Vermont',
  },
] as const

export default function HomeBornfidisEditorial() {
  return (
    <PublicMarketingShell>
      {/* Hero — The Private Table */}
      <section className="border-b border-[#C9A84C]/35 pt-28 md:pt-32">
        <PageContainer wide className="pb-12 text-center md:pb-16">
          <p className={bookEyebrow}>Bornfidis Provisions · Vermont</p>
          <h1 className={`${bookHeadline} mx-auto mt-4 max-w-4xl text-[clamp(2.25rem,6vw,4rem)]`}>
            The Private Table
          </h1>
          <p className={`${bookBody} mx-auto mt-6 max-w-2xl`}>
            Intimate private chef experiences — Caribbean soul, farm-to-table precision, and hospitality
            shaped around your evening.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton theme="culinary" href="/book">
              Book Private Dining
            </PrimaryButton>
            <SecondaryButton theme="culinary" href="/experience">
              The Experience
            </SecondaryButton>
          </div>
        </PageContainer>
        <PageContainer wide className="pb-16 md:pb-24">
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            <Image
              src={IMG_HERO}
              alt="Candlelit private dining table — Bornfidis Provisions"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1440px) 100vw, 1440px"
            />
          </div>
        </PageContainer>
      </section>

      {/* Philosophy */}
      <section className={bookSection}>
        <PageContainer wide>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-square w-full max-w-lg overflow-hidden justify-self-center lg:justify-self-start">
              <Image
                src={IMG_PHILOSOPHY}
                alt="Chef plating a course with precision"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className={bookEyebrow}>Our philosophy</p>
              <h2 className={`${bookHeadline} mt-4`}>Warmth &amp; Precision</h2>
              <p className={`${bookBody} mt-6`}>
                Every Bornfidis evening balances the discipline of world-class kitchens with the warmth of
                true hospitality. We cook with intention — seasonal ingredients, refined technique, and a
                table set for connection.
              </p>
              <p className={`${bookBody} mt-4`}>
                From Vermont retreats to Jamaican villas, your menu is built around you: dietary needs,
                occasion, and the story you want the night to tell.
              </p>
              <Link
                href="/story"
                className="mt-8 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] no-underline hover:text-[#2c2c2c]"
              >
                Our story →
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Services */}
      <section className={bookSection}>
        <PageContainer wide>
          <p className={`${bookEyebrow} text-center`}>Services</p>
          <h2 className={`${bookHeadline} mt-4 text-center`}>Crafted for Your Occasion</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {SERVICES.map((s) => (
              <BrandedCard key={s.title} theme="culinary" className="flex h-full flex-col">
                <h3 className="font-display text-xl text-[#2c2c2c]">{s.title}</h3>
                <p className={`${bookBody} mt-4 flex-1 text-sm`}>{s.desc}</p>
                <p className="mt-6 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A84C]">
                  {s.price}
                </p>
                <Link
                  href={s.href}
                  className="mt-4 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/70 no-underline hover:text-[#C9A84C]"
                >
                  Learn more →
                </Link>
              </BrandedCard>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Sample menu */}
      <section className={bookSection}>
        <PageContainer wide className="max-w-3xl">
          <p className={`${bookEyebrow} text-center`}>A taste of the experience</p>
          <h2 className={`${bookHeadline} mt-4 text-center`}>Sample Menu</h2>
          <p className={`${bookBody} mx-auto mt-4 text-center text-sm`}>
            Every menu is customized — this is a glimpse of our style.
          </p>
          <ul className="mt-12 divide-y divide-[#C9A84C]/25">
            {SAMPLE_MENU.map((item) => (
              <li key={item.name} className="py-6 first:pt-0 last:pb-0">
                <h3 className="font-display text-lg text-[#2c2c2c] md:text-xl">{item.name}</h3>
                <p className="mt-2 font-sans text-sm italic text-[#2c2c2c]/65">{item.desc}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <SecondaryButton theme="culinary" href="/menu">
              View full sample menus
            </SecondaryButton>
          </div>
        </PageContainer>
      </section>

      {/* Story teaser */}
      <section className={bookSection}>
        <PageContainer wide>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={bookEyebrow}>Our story</p>
              <h2 className={`${bookHeadline} mt-4`}>From World-Class Kitchens to Your Home</h2>
              <p className={`${bookBody} mt-6`}>
                Caribbean roots, refined technique, and Vermont hospitality — Chef Brian brings the
                discipline of shipboard and resort kitchens to intimate tables across Jamaica and New
                England.
              </p>
              <PrimaryButton theme="culinary" href="/story" className="mt-8">
                Read the story
              </PrimaryButton>
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={IMG_STORY}
                alt="Chef Brian at the grill"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Testimonials */}
      <section className={bookSection}>
        <PageContainer wide>
          <p className={`${bookEyebrow} text-center`}>At the table</p>
          <h2 className={`${bookHeadline} mt-4 text-center`}>What Guests Say</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="border-t border-[#C9A84C]/35 pt-8">
                <p className={`${bookBody} text-base italic`}>&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6">
                  <cite className="font-display text-base not-italic text-[#2c2c2c]">{t.name}</cite>
                  <p className="mt-1 font-sans text-xs text-[#2c2c2c]/55">{t.detail}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA */}
      <section className={`${bookSection} border-b-0`}>
        <PageContainer wide className="border border-[#C9A84C]/35 bg-[#fdf8f8] px-8 py-12 text-center md:px-16 md:py-16">
          <h2 className={bookHeadline}>Reserve Your Evening</h2>
          <p className={`${bookBody} mx-auto mt-4 max-w-xl`}>
            Tell us about your occasion — we&apos;ll shape a private dining experience with clarity and care.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton theme="culinary" href="/book">
              Start your inquiry
            </PrimaryButton>
            <SecondaryButton
              theme="culinary"
              href="https://wa.me/18027335348?text=Hi%20Brian%2C%20I%27d%20like%20to%20discuss%20a%20private%20dining%20experience."
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </SecondaryButton>
          </div>
        </PageContainer>
      </section>

    </PublicMarketingShell>
  )
}
