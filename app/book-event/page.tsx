import type { Metadata } from 'next'
import { EventInquiryForm } from '@/components/quote/EventInquiryForm'

export const metadata: Metadata = {
  title: 'Book an event | Bornfidis Provisions',
  description: 'Request a farm-to-table event quote — we will email your personalized estimate.',
}

export default function BookEventPage() {
  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <EventInquiryForm />
    </main>
  )
}
