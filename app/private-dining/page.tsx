import type { Metadata } from 'next'

import PrivateDining from '@/components/private-dining/PrivateDining'
import '@/components/private-dining/private-dining.css'

export const metadata: Metadata = {
  title: 'Private Dining — The Chef\'s Passage | Bornfidis',
  description:
    "The Chef's Passage — Bornfidis signature private dining in Vermont from $1,200. Five courses, tableside service, full cleanup. Jamaica via partner inquiry.",
}

export default function PrivateDiningPage() {
  return <PrivateDining />
}
