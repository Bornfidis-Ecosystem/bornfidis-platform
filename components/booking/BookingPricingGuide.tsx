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
          title="A Premium Experience, Tailored to You"
          subtitle="Each Bornfidis Provisions experience is carefully curated based on your preferences, guest count, and event style. Most private dining experiences begin at $150–$300 per person."
        />
      </PageContainer>
    </section>
  )
}
