import type { Metadata } from 'next'

import PartnersPageContent from '@/components/partners/PartnersPageContent'

export const metadata: Metadata = {
  title: 'Work with Bornfidis — Partners & Investors',
  description:
    'Bornfidis builds signature dining experiences and flavor systems for hospitality operators, brands, and investors.',
}

export default function PartnersPage() {
  return <PartnersPageContent />
}
