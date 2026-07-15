import type { Metadata } from 'next'

import DigitalStudioApplyClient from './DigitalStudioApplyClient'

export const metadata: Metadata = {
  title: 'Apply — Bornfidis Digital Studio',
  description:
    'Apply to the Bornfidis Digital Studio pilot — digital systems for food, farm, and hospitality businesses.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DigitalStudioApplyPage() {
  return <DigitalStudioApplyClient />
}
