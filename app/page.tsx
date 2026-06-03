import type { Metadata } from 'next'

import HomeEditorial from '@/components/home/HomeEditorial'
import '@/components/home/home-editorial.css'

export const metadata: Metadata = {
  title: 'Bornfidis — Caribbean Heart. Vermont Hands.',
  description:
    'Bornfidis is a private dining and provisions company rooted in Caribbean culinary identity and Vermont craft. Born for this. Made for your table.',
}

export default function HomePage() {
  return <HomeEditorial />
}
