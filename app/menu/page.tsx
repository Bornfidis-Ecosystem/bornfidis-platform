import type { Metadata } from 'next'

import { MenuHero } from '@/components/menu/MenuHero'
import { SampleMenuGrid } from '@/components/menu/SampleMenuGrid'
import { MenuCustomizationNote } from '@/components/menu/MenuCustomizationNote'
import { MenuPageCta } from '@/components/menu/MenuPageCta'
import { PublicMarketingShell } from '@/components/layout/PublicMarketingShell'

export const metadata: Metadata = {
  title: 'Sample Menus | Bornfidis Provisions',
  description:
    'A glimpse of Bornfidis Provisions private dining — seasonal, customized, chef-led experiences.',
}

export default function MenuPage() {
  return (
    <PublicMarketingShell active="menu">
      <MenuHero />
      <SampleMenuGrid />
      <MenuCustomizationNote />
      <MenuPageCta />
    </PublicMarketingShell>
  )
}
