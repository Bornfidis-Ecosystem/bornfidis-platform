import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function BookingPricingGuide() {
  return (
    <section className="border-t border-brass/15 px-0 py-16 md:py-20" style={{ backgroundColor: '#141414' }}>
      <PageContainer>
        <SectionHeading
          eyebrow="Investment"
          title="A Premium Experience, Tailored to You"
          subtitle="Each Bornfidis Provisions experience is carefully curated based on your preferences, guest count, and event style. Most private dining experiences begin at $150–$300 per person."
        />
      </PageContainer>
    </section>
  )
}
