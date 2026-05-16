import { PageContainer } from '@/components/ui/PageContainer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { bookHeadline, bookSection } from '@/components/booking/book-culinary-classes'

export function BookingFinalCta() {
  return (
    <section className={`${bookSection} border-b-0`}>
      <PageContainer wide className="text-center">
        <h2 className={`${bookHeadline} mx-auto max-w-2xl text-[clamp(1.75rem,4vw,2.5rem)]`}>
          Let&apos;s Create Something Memorable
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-[#2c2c2c]/75">
          Tell us about your table — we will take it from there.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryButton theme="culinary" href="#booking-form" className="min-w-[220px]">
            Submit Your Inquiry
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  )
}
