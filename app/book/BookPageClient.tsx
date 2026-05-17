import { BookingFaq } from '@/components/booking/BookingFaq'
import { BookingFinalCta } from '@/components/booking/BookingFinalCta'
import { BookingHero } from '@/components/booking/BookingHero'
import { BookingInquiryForm } from '@/components/booking/BookingInquiryForm'
import { BookingPricingGuide } from '@/components/booking/BookingPricingGuide'
import { BookingTrustBar } from '@/components/booking/BookingTrustBar'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'

/**
 * Private dining inquiry — Culinary OS editorial layout (Bone / Slate / Gold / Forest CTA).
 */
export default function BookPageClient() {
  return (
    <PublicMarketingShell active="book">
      <BookingHero />
      <BookingTrustBar />
      <BookingPricingGuide />
      <BookingInquiryForm />
      <BookingFaq />
      <BookingFinalCta />
    </PublicMarketingShell>
  )
}
