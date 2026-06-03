import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { bookBody, bookSection } from '@/components/booking/book-culinary-classes'

export function MenuPageCta() {
  return (
    <section className={`${bookSection} border-b-0`}>
      <PageContainer wide className="text-center">
        <p className={bookBody}>Ready to plan a table that matches the moment?</p>
        <div className="mt-6 flex justify-center">
          <PrimaryButton theme="culinary" href="/book" className="min-w-[220px]">
            Book Your Experience
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
