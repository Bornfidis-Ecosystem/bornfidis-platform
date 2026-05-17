import type { Metadata } from 'next'

import ContactPageContent from '@/components/contact/ContactPageContent'

export const metadata: Metadata = {
  title: 'Contact | Bornfidis Provisions',
  description:
    'Contact Bornfidis for private chef dining, retreats, villa hospitality, and custom culinary experiences.',
}

export default function ContactPage() {
  return <ContactPageContent />
}
