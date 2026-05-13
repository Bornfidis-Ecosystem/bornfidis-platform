import { PageContainer } from '@/components/ui/PageContainer'

export function ExperienceHero() {
  return (
    <header className="border-b border-brass/15 bg-midnight pt-28 pb-20 md:pt-32 md:pb-24">
      <PageContainer>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brass">The experience</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] text-cream">More Than Dinner</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/78 md:text-xl">
          A private dining experience shaped by intention, hospitality, and refined execution.
        </p>
      </PageContainer>
    </header>
  )
}
