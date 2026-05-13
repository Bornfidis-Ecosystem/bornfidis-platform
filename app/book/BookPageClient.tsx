import BrutalistBookingNav from '@/components/layout/BrutalistBookingNav'
import { BookingHero } from '@/components/booking/BookingHero'
import { BookingTrustBar } from '@/components/booking/BookingTrustBar'
import { BookingPricingGuide } from '@/components/booking/BookingPricingGuide'
import { BookingInquiryForm } from '@/components/booking/BookingInquiryForm'
import { BookingFaq } from '@/components/booking/BookingFaq'
import { BookingFinalCta } from '@/components/booking/BookingFinalCta'

const BG = '#080808'

/**
 * Private dining inquiry — wireframe sections: hero, trust, pricing, form, FAQ, final CTA.
 */
export default function BookPageClient() {
  return (
    <div className="home-brutalist-root relative min-h-screen text-cream" style={{ backgroundColor: BG }}>
      <BrutalistBookingNav />
      <BookingHero />
      <BookingTrustBar />
      <BookingPricingGuide />
      <BookingInquiryForm />
      <BookingFaq />
      <BookingFinalCta />
    </div>
  )
}
