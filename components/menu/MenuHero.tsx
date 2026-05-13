import { PageContainer } from '@/components/ui/PageContainer'

export function MenuHero() {
  return (
    <header className="border-b border-brass/15 bg-midnight pt-28 pb-16 md:pt-32 md:pb-20">
      <PageContainer>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brass">Bornfidis Provisions</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight text-cream">Sample Menus</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/75 md:text-lg">
          Every Bornfidis Provisions experience is customized, but here&apos;s a glimpse of our style.
        </p>
      </PageContainer>
    </header>
  )
}
