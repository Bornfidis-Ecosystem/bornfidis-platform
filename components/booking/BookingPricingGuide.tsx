import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { bookSection } from '@/components/booking/book-culinary-classes'

export function BookingPricingGuide() {
  return (
    <section className={bookSection}>
      <PageContainer wide>
        <SectionHeading
          theme="culinary"
          eyebrow="Investment"
          title="The Chef's Passage Begins at $1,200"
          subtitle="Your proposal confirms the seasonal menu direction, guest count, service format, and every included or separately quoted requirement before you pay the 30% deposit."
        />
      </PageContainer>
    </section>
  )
}
