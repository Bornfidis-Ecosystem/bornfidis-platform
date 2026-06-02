import type { Metadata } from 'next'

import PrivateDining from '@/components/private-dining/PrivateDining'
import '@/components/private-dining/private-dining.css'

export const metadata: Metadata = {
  title: 'Private Dining — Bornfidis',
  description:
    'Bespoke, chef-led private dining in your home, chalet, or Vermont retreat. Custom menus. Full service. Complete cleanup. From $150 per person.',
}

export default function PrivateDiningPage() {
  return <PrivateDining />
}
