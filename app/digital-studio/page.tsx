import type { Metadata } from 'next'

import DigitalStudioPageContent from '@/components/digital-studio/DigitalStudioPageContent'

export const metadata: Metadata = {
  title: 'Digital Studio — Bornfidis',
  description:
    'Digital systems for food, farm, and hospitality businesses — bookings, brand, and back-of-house. Pilot applications open.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DigitalStudioPage() {
  return <DigitalStudioPageContent />
}
