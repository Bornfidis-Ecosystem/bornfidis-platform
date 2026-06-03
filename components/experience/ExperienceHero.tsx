import { PageContainer } from '@/components/ui/PageContainer'
import { bookBody, bookEyebrow, bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

export function ExperienceHero() {
  return (
    <header className={`${bookSection} border-t-0 pt-28 md:pt-32`}>
      <PageContainer wide className="text-center md:text-left">
        <p className={bookEyebrow}>The experience</p>
        <h1 className={`${bookHeadline} mt-4 text-[clamp(2.25rem,5vw,3.5rem)]`}>More Than Dinner</h1>
        <p className={`${bookBody} mt-6 max-w-2xl`}>
          A private dining experience shaped by intention, hospitality, and refined execution.
        </p>
      </PageContainer>
    </header>
  )
}
