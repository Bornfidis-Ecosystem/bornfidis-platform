import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

export function ExperiencePageCta() {
  return (
    <section className={`${bookSection} border-b-0`}>
      <PageContainer wide className="text-center">
        <h2 className={`${bookHeadline} text-2xl`}>Ready to begin?</h2>
        <div className="mt-8 flex justify-center">
          <PrimaryButton theme="culinary" href="/book" className="min-w-[220px]">
            Book Your Experience
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
