import BookingCulinaryNav from '@/components/layout/BookingCulinaryNav'
import { BookingHero } from '@/components/booking/BookingHero'
import { BookingTrustBar } from '@/components/booking/BookingTrustBar'
import { BookingPricingGuide } from '@/components/booking/BookingPricingGuide'
import { BookingInquiryForm } from '@/components/booking/BookingInquiryForm'
import { BookingFaq } from '@/components/booking/BookingFaq'
import { BookingFinalCta } from '@/components/booking/BookingFinalCta'

/**
 * Private dining inquiry — Culinary OS editorial layout (Bone / Slate / Gold / Forest CTA).
 */
export default function BookPageClient() {
  return (
    <div className="relative min-h-screen bg-[#fdf8f8] text-[#2c2c2c]">
      <BookingCulinaryNav />
      <main className="mx-auto w-full max-w-[1440px]">
        <BookingHero />
        <BookingTrustBar />
        <BookingPricingGuide />
        <BookingInquiryForm />
        <BookingFaq />
        <BookingFinalCta />
      </main>
    </div>
  )
}
