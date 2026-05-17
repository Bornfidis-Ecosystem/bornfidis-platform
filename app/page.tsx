import type { Metadata } from 'next'

import HomeBornfidisEditorial from '@/components/home/HomeBornfidisEditorial'

export const metadata: Metadata = {
  title: 'Bornfidis Provisions | Private Chef Vermont',
  description:
    'Bornfidis Provisions — Private chef experiences in Vermont and Jamaica. Caribbean fine dining, live-fire cooking, and intimate hospitality crafted by Chef Brian Maylor.',
}

export default function HomePage() {
  return <HomeBornfidisEditorial />
}
