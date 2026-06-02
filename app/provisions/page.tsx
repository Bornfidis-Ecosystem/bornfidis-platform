import type { Metadata } from 'next'

import Provisions from '@/components/provisions/Provisions'
import '@/components/provisions/provisions.css'

export const metadata: Metadata = {
  title: 'Provisions — Bornfidis',
  description:
    'Small-batch pantry essentials forged at the intersection of Jamaica and Vermont. Maple Jerk Blend. Vermont Smoked Sea Salt. Caribbean Chili Oil. Limited quantities.',
}

export default function ProvisionsPage() {
  return <Provisions />
}
