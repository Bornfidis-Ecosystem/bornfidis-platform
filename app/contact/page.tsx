import type { Metadata } from 'next'
import { Suspense } from 'react'

import ContactPageContent from '@/components/contact/ContactPageContent'

export const metadata: Metadata = {
  title: 'Contact — Bornfidis',
  description:
    'Contact Bornfidis for private dining, cooking classes, and small-batch provisions. Caribbean-inspired. Vermont-crafted.',
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  )
}
