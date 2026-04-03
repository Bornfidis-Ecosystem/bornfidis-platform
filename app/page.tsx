import fs from 'node:fs'
import path from 'node:path'

import Link from 'next/link'

import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { homepageImages } from '@/lib/homepage-images'

function publicFileExists(publicUrlPath: string): boolean {
  const segments = publicUrlPath.split('/').filter(Boolean)
  if (segments.length === 0) return false
  const filePath = path.join(process.cwd(), 'public', ...segments)
  return fs.existsSync(filePath)
}

function FeaturedFoodFallback() {
  return (
    <div className="relative aspect-[21/9] min-h-[200px] w-full overflow-hidden rounded-2xl border border-[#B89145]/25 bg-gradient-to-br from-[#0f1814] to-[#1a2620] sm:min-h-[240px] md:rounded-3xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_40%,rgba(184,145,69,0.18)_0%,transparent_55%),radial-gradient(ellipse_70%_50%_at_70%_70%,rgba(246,242,232,0.06)_0%,transparent_50%)] opacity-90" />
      <div className="relative flex h-full min-h-[inherit] flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#B89145]">
          Chef-crafted
        </p>
        <p className="mt-3 max-w-md font-serif text-xl text-[#F6F2E8] md:text-2xl">
          Seasonal courses, composed for your table
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#E9DFC8]/85">
          Photography coming soon — your menu is always tailored to the season
          and the moment.
        </p>
      </div>
    </div>
  )
}

const btnPrimaryClass =
  'inline-flex min-h-[48px] min-w-[min(100%,12rem)] items-center justify-center rounded-full bg-[#B89145] px-8 py-3.5 text-center text-base font-semibold text-[#111917] shadow-md shadow-black/25 transition hover:opacity-95 active:scale-[0.99]'

const btnSecondaryClass =
  'inline-flex min-h-[48px] min-w-[min(100%,12rem)] items-center justify-center rounded-full border-2 border-[#B89145]/55 bg-transparent px-8 py-3.5 text-center text-base font-semibold text-[#F6F2E8] transition hover:border-[#B89145] hover:bg-white/5 active:scale-[0.99]'

export default function HomePage() {
  const featuredFoodSrc = publicFileExists(homepageImages.experienceBoard ?? '')
    ? homepageImages.experienceBoard
    : null

  return (
    <div className="bg-[#0E1714] text-[#F6F2E8]">
      {/* Hero + featured food */}
      <section className="border-b border-[#B89145]/20">
        <div className="mx-auto max-w-5xl px-5 py-14 text-center sm:px-6 md:px-10 md:py-24 lg:py-28">
          <h1 className="text-[2.125rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl xl:text-[3.65rem] xl:leading-[1.08]">
            Private Chef Experiences in Vermont
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#E9DFC8] sm:mt-6 sm:text-lg sm:leading-8">
            Elevated dining inspired by Caribbean heritage and refined through
            luxury hospitality.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#C4B8A4] sm:text-[0.9375rem]">
            Chef-led private dining shaped by Caribbean roots, luxury hospitality
            standards, and personalized service.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link href="/book" className={btnPrimaryClass}>
              Request a Booking
            </Link>
            <a href="#sample-menu" className={btnSecondaryClass}>
              View Sample Menu
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 pb-12 sm:px-6 md:px-10 md:pb-16 lg:pb-20">
          <HomepageBrandImage
            src={featuredFoodSrc}
            alt="Curated private chef courses — seasonal ingredients and refined plating"
            variant="banner"
            priority
            className="!border-[#B89145]/25 bg-[#111917] shadow-lg shadow-black/30"
            fallback={<FeaturedFoodFallback />}
          />
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-[#B89145]/20">
        <div className="mx-auto grid max-w-5xl gap-3 px-5 py-6 text-sm tracking-wide text-[#E9DFC8] sm:px-6 md:grid-cols-3 md:gap-4 md:px-10 md:py-7">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <span className="text-[#B89145]">•</span>
            <span>Private In-Home Dining</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#B89145]">•</span>
            <span>Curated Multi-Course Menus</span>
          </div>
          <div className="flex items-center justify-center gap-2 md:justify-end">
            <span className="text-[#B89145]">•</span>
            <span>Professional, Seamless Experience</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <h2 className="text-3xl font-semibold md:text-4xl">
          Rooted in Craft. Elevated by Experience.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#E9DFC8] sm:mt-6 sm:text-lg sm:leading-8">
          Mountain Maple Fire delivers discreet, detail-driven private dining for
          hosts who value exceptional food, calm service, and a beautifully
          composed evening.
        </p>
      </section>

      {/* Sample Menu */}
      <section
        id="sample-menu"
        className="border-y border-[#B89145]/20 bg-[#111D19]"
      >
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 md:px-10 md:py-20">
          <h2 className="text-3xl font-semibold md:text-4xl">Sample Menu</h2>
          <ol className="mt-6 space-y-3 text-base leading-relaxed text-[#E9DFC8] sm:mt-8 sm:space-y-4 sm:text-lg sm:leading-8">
            <li>1. Artisan Cheese Board</li>
            <li>2. Seasonal Starter</li>
            <li>3. Soup or Salad Course</li>
            <li>4. Filet Mignon, Chef Signature Preparation</li>
            <li>5. Refined Dessert Course</li>
          </ol>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <h2 className="text-3xl font-semibold md:text-4xl">How It Works</h2>
        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-3 md:gap-5">
          <div className="rounded-2xl border border-[#B89145]/25 bg-[#101915] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B89145]">
              Step 1
            </p>
            <p className="mt-3 text-xl">Inquiry</p>
            <p className="mt-2 text-sm leading-relaxed text-[#E9DFC8] sm:text-base">
              Share your date, guest count, and preferred style of dining.
            </p>
          </div>
          <div className="rounded-2xl border border-[#B89145]/25 bg-[#101915] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B89145]">
              Step 2
            </p>
            <p className="mt-3 text-xl">Menu</p>
            <p className="mt-2 text-sm leading-relaxed text-[#E9DFC8] sm:text-base">
              We design a curated multi-course menu tailored to your event.
            </p>
          </div>
          <div className="rounded-2xl border border-[#B89145]/25 bg-[#101915] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B89145]">
              Step 3
            </p>
            <p className="mt-3 text-xl">Experience</p>
            <p className="mt-2 text-sm leading-relaxed text-[#E9DFC8] sm:text-base">
              Arrive, host, and enjoy while every detail is handled with care.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-[#B89145]/20 bg-[#111D19]">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 md:px-10 md:py-16">
          <p className="max-w-3xl text-base leading-relaxed text-[#E9DFC8] sm:text-lg sm:leading-8">
            Trusted by discerning hosts across Vermont, our private chef
            experiences are chosen for their precision, warmth, and polished
            execution from first inquiry to final course.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 md:px-10 md:py-24">
        <h2 className="text-3xl font-semibold md:text-5xl">
          Let&apos;s Create Your Experience
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10">
          <Link href="/book" className={btnPrimaryClass}>
            Request a Booking
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-[#C4B8A4]">
            Prefer to connect before you book?{' '}
            <Link
              href="/contact"
              className="font-medium text-[#E9DFC8] underline decoration-[#B89145]/50 underline-offset-4 transition hover:text-[#F6F2E8] hover:decoration-[#B89145]"
            >
              Contact us directly
            </Link>{' '}
            — we typically reply within one business day.
          </p>
        </div>
      </section>
    </div>
  )
}
