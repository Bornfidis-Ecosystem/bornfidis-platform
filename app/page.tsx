import type { Metadata } from 'next'

import HomeEditorial from '@/components/home/HomeEditorial'
import '@/components/home/home-editorial.css'

export const metadata: Metadata = {
  title: 'Bornfidis — Caribbean Heart. Vermont Hands.',
  description:
    'Chef-led private dining and small-batch provisions rooted in Jamaican tradition and Vermont craft. Serving Vermont now — Jamaica and select travel by advance request.',
}

export default function HomePage() {
  return <HomeEditorial />
}
