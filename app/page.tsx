import type { Metadata } from 'next'

import HomeBornfidisEditorial from '@/components/home/HomeBornfidisEditorial'

export const metadata: Metadata = {
  title: 'Bornfidis Provisions | Private Chef Vermont',
  description:
    'Private chef experiences in Vermont — Caribbean cuisine, farm-to-table menus, and intimate dining crafted by Chef Brian.',
}

export default function HomePage() {
  return <HomeBornfidisEditorial />
}
