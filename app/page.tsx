import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, Playfair_Display } from 'next/font/google'

import HomeBornfidisBrutalist from '@/components/home/HomeBornfidisBrutalist'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-home-bebas',
})

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-home-dm',
})

const playfairAccent = Playfair_Display({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  variable: '--font-home-playfair',
})

export const metadata: Metadata = {
  title: 'Bornfidis Provisions | Private Chef Vermont',
  description:
    'Private chef experiences in Vermont — Caribbean cuisine, farm-to-table menus, and intimate dining crafted by Chef Brian.',
}

export default function HomePage() {
  return (
    <div
      className={`${bebas.variable} ${dmSans.variable} ${playfairAccent.variable}`}
    >
      <HomeBornfidisBrutalist />
    </div>
  )
}
