import type { ReactNode } from 'react'
import { HomepageBrandImage } from '@/components/home/HomepageBrandImage'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'
import { ChefBio } from '@/components/story/ChefBio'
import {
  bookBody,
  bookEyebrow,
  bookHeadline,
  bookSection,
} from '@/components/booking/book-culinary-classes'
import { BrandedCard } from '@/components/ui/BrandedCard'
import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { storyImages } from '@/lib/story-images'

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className={bookEyebrow}>{children}</p>
}

const ecosystemCards = [
  {
    title: 'Food — Provisions & Experiences',
    description:
      'Private chef services, curated dining, and small-batch products rooted in Caribbean excellence.',
  },
  {
    title: 'Clothing — Sportswear',
    description: 'Performance-driven apparel designed for movement, identity, and lifestyle.',
  },
  {
    title: 'Housing — Future Vision',
    description: 'Sustainable living solutions focused on community development and long-term impact.',
  },
  {
    title: 'Education — Academy',
    description:
      'Digital tools, field guides, and knowledge systems to empower individuals and entrepreneurs.',
  },
] as const

const values = [
  { label: 'Faith', text: 'Trusting the journey and staying grounded in purpose' },
  { label: 'Integrity', text: 'Doing what is right, even when it is difficult' },
  { label: 'Excellence', text: 'Delivering quality without compromise' },
  { label: 'Innovation', text: 'Building forward with intention and creativity' },
  { label: 'Sustainability', text: 'Thinking long-term in every decision' },
  { label: 'Service', text: 'Putting people at the center of what we do' },
  { label: 'Legacy', text: 'Creating something that outlives us' },
] as const

export function StoryPageContent() {
  return (
    <PublicMarketingShell active="story">
      {/* Hero */}
      <section className="border-b border-[#C9A84C]/35 pt-28 md:pt-32">
        <PageContainer wide>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={bookEyebrow}>Our story</p>
              <h1 className={`${bookHeadline} mt-4 text-[clamp(2rem,5vw,3.25rem)]`}>
                Rooted in Purpose.{' '}
                <span className="text-[#C9A84C]">Built Through Experience.</span>
              </h1>
              <p className={`${bookBody} mt-6`}>
                From the kitchens of world-class hospitality to the fields of Jamaica, Bornfidis was built on a
                simple truth —{' '}
                <strong className="font-semibold text-[#2c2c2c]">
                  food, service, and community can transform lives.
                </strong>
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton theme="culinary" href="/book">
                  Book an experience
                </PrimaryButton>
                <SecondaryButton theme="culinary" href="#the-craft">
                  Read the story
                </SecondaryButton>
              </div>
            </div>
            <HomepageBrandImage
              src={storyImages.hero}
              alt="Chef Brian — craft, discipline, and the kitchen"
              priority
              variant="hero"
              className="min-h-[320px] w-full"
            />
          </div>
        </PageContainer>
      </section>

      <ChefBio />

      <section id="the-craft" className={`${bookSection} scroll-mt-24`}>
        <PageContainer wide>
          <SectionEyebrow>The craft</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>A Foundation Built at Sea and Beyond</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className={`${bookBody} space-y-6`}>
              <p>
                Excellence is not an accident. It is built through discipline, repetition, and a commitment to
                doing things the right way — even when no one is watching.
              </p>
              <p>
                For over a decade, my journey has been shaped inside high-performance kitchens serving thousands
                of guests from around the world. From fine dining to large-scale operations, every environment
                demanded the same standard: precision, consistency, and respect for the craft.
              </p>
            </div>
            <BrandedCard theme="culinary">
              <p className="font-display text-lg text-[#2c2c2c]">Every plate carried responsibility.</p>
              <p className={`${bookBody} mt-4`}>Every service required focus.</p>
              <p className={`${bookBody} mt-4`}>Every detail mattered.</p>
              <p className={`${bookBody} mt-6`}>That foundation is what Bornfidis stands on today.</p>
            </BrandedCard>
          </div>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <SectionEyebrow>The shift</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>From Kitchen to Community</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div className={`${bookBody} space-y-6`}>
              <p>Over time, the vision grew beyond the plate.</p>
              <p>
                True excellence is not only about what we serve — it is about where it comes from, who it impacts,
                and what it creates for the future.
              </p>
              <p className="font-semibold text-[#2c2c2c]">
                Bornfidis was created to bridge the gap between skill and opportunity, connecting:
              </p>
              <ul className="list-none space-y-2 border-l-2 border-[#C9A84C]/40 pl-6">
                <li>Farmers to markets</li>
                <li>Food to families</li>
                <li>Craft to community</li>
              </ul>
            </div>
            <BrandedCard theme="culinary">
              <p className={bookBody}>
                What started as a personal journey in the kitchen has become a mission to build something larger —
                something that feeds not just people, but possibility.
              </p>
            </BrandedCard>
          </div>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <HomepageBrandImage
            src={storyImages.transition}
            alt="Jamaican land and water — regenerative growth at the source"
            variant="banner"
            className="w-full"
          />
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <SectionEyebrow>The ecosystem</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>The Bornfidis Ecosystem</h2>
          <p className={`${bookBody} mt-6 max-w-3xl`}>
            Bornfidis is more than a brand. It is a system designed to grow, support, and sustain itself across
            four key pillars:
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {ecosystemCards.map((card) => (
              <BrandedCard key={card.title} theme="culinary">
                <h3 className="font-display text-xl text-[#2c2c2c]">{card.title}</h3>
                <p className={`${bookBody} mt-4 text-sm`}>{card.description}</p>
              </BrandedCard>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide className="max-w-3xl text-center">
          <SectionEyebrow>Values</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>What We Stand On</h2>
          <ul className={`${bookBody} mt-10 space-y-4 text-left`}>
            {values.map((v) => (
              <li key={v.label}>
                <strong className="font-semibold text-[#2c2c2c]">{v.label}</strong> — {v.text}
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className={bookSection}>
        <PageContainer wide>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <HomepageBrandImage
              src={storyImages.community}
              alt="Farmers and harvest — people behind Bornfidis provisions"
              variant="section"
              className="min-h-[280px] w-full"
            />
            <div>
              <SectionEyebrow>Community</SectionEyebrow>
              <h2 className={`${bookHeadline} mt-4`}>Built With People, Not Just Products</h2>
              <p className={`${bookBody} mt-6`}>
                Behind every plate, every product, and every experience is a network of people — chefs, farmers,
                partners, and supporters — working together toward a shared vision.
              </p>
              <p className={`${bookBody} mt-4`}>
                Bornfidis is not built alone. It is built through collaboration, trust, and a commitment to
                lifting others as we grow.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className={`${bookSection} border-b-0`}>
        <PageContainer wide className="text-center">
          <SectionEyebrow>Ready when you are</SectionEyebrow>
          <h2 className={`${bookHeadline} mt-4`}>Be Part of the Journey</h2>
          <p className={`${bookBody} mx-auto mt-6 max-w-2xl`}>
            Whether you&apos;re looking for an unforgettable dining experience, quality provisions, or a deeper
            connection to food and community — Bornfidis welcomes you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton theme="culinary" href="/book">
              Book an experience
            </PrimaryButton>
            <SecondaryButton theme="culinary" href="/contact">
              Join the ecosystem
            </SecondaryButton>
          </div>
        </PageContainer>
      </section>
    </PublicMarketingShell>
  )
}
