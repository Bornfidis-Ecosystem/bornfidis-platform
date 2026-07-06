import type { Metadata } from 'next'

import Provisions from '@/components/provisions/Provisions'
import '@/components/provisions/provisions.css'

export const metadata: Metadata = {
  title: 'Provisions — Bornfidis',
  description:
    'Small-batch pantry provisions from Vermont and Jamaica. Maple Jerk Rub, Maple Escovitch, Green Seasoning, and Sorrel Gastrique — request a batch.',
}

export default function ProvisionsPage() {
  return <Provisions />
}
