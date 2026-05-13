import type { Metadata } from 'next'
import BrutalistBookingNav from '@/components/layout/BrutalistBookingNav'
import { MenuHero } from '@/components/menu/MenuHero'
import { SampleMenuGrid } from '@/components/menu/SampleMenuGrid'
import { MenuCustomizationNote } from '@/components/menu/MenuCustomizationNote'
import { MenuPageCta } from '@/components/menu/MenuPageCta'

export const metadata: Metadata = {
  title: 'Sample Menus | Bornfidis Provisions',
  description:
    'A glimpse of Bornfidis Provisions private dining — seasonal, customized, chef-led experiences.',
}

export default function MenuPage() {
  return (
    <div className="home-brutalist-root min-h-screen bg-midnight text-cream">
      <BrutalistBookingNav />
      <MenuHero />
      <SampleMenuGrid />
      <MenuCustomizationNote />
      <MenuPageCta />
    </div>
  )
}
