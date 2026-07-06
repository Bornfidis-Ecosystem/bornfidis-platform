import type { Metadata } from 'next'

import BookPageClient from './BookPageClient'

export const metadata: Metadata = {
  title: 'Book a Private Chef | Bornfidis Provisions · Vermont',
  description:
    "Request The Chef's Passage — chef-led private dining in Vermont and the Northeast. Jamaica inquiries routed to our partner team.",
}

export default function BookPage() {
  return <BookPageClient />
}
