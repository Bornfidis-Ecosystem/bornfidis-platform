import type { Metadata } from 'next'

import BookPageClient from './BookPageClient'

export const metadata: Metadata = {
  title: 'Book Private Dining | Bornfidis Provisions',
  description:
    'Request chef-led private dining — tailored menus, deposit-secured bookings, Vermont & Jamaica availability.',
}

export default function BookPage() {
  return <BookPageClient />
}
