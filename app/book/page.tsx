import type { Metadata } from 'next'

import BookPageClient from './BookPageClient'

export const metadata: Metadata = {
  title: 'Book a Private Chef | Bornfidis Provisions',
  description:
    'Request a private chef experience in Vermont — intimate dining, retreats, and events.',
}

export default function BookPage() {
  return <BookPageClient />
}
