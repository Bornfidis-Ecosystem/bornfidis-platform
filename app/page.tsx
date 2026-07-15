import type { Metadata } from 'next'

import HomeEditorial from '@/components/home/HomeEditorial'
import '@/components/home/home-editorial.css'

export const metadata: Metadata = {
  title: 'Bornfidis — Practical Systems for Food, Hospitality and Enterprise',
  description:
    'Bornfidis brings together chef-led hospitality (Provisions) and digital operating systems (Digital Studio)—built to help people serve well, grow responsibly and create lasting value.',
  alternates: { canonical: 'https://bornfidis.com' },
}

export default function HomePage() {
  return <HomeEditorial />
}
