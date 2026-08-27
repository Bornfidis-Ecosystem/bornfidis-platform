import type { Metadata } from 'next'

import HomeEditorial from '@/components/home/HomeEditorial'
import '@/components/home/home-editorial.css'

export const metadata: Metadata = {
  title: 'Private Dining in Vermont | Bornfidis',
  description:
    'Jamaican–Vermont private dining in your home, chalet, or retreat. Chef-led food, tableside hospitality, setup, service, and kitchen cleanup.',
  alternates: { canonical: 'https://bornfidis.com' },
}

export default function HomePage() {
  return <HomeEditorial />
}
