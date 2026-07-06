import type { Metadata } from 'next'

import HomeEditorial from '@/components/home/HomeEditorial'
import '@/components/home/home-editorial.css'

export const metadata: Metadata = {
  title: 'Bornfidis — Caribbean Heart. Vermont Hands.',
  description:
    'Host an unforgettable private dining experience in Vermont, New Jersey, or Jamaica. Bornfidis Provisions — chef-led tables, small-batch pantry, and cooking classes.',
}

export default function HomePage() {
  return <HomeEditorial />
}
