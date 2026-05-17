import type { Metadata } from 'next'

import { StoryPageContent } from '@/components/story/StoryPageContent'

export const metadata: Metadata = {
  title: 'Our Story | Bornfidis Provisions',
  description:
    'Rooted in purpose, built through experience — the Bornfidis journey from world-class kitchens to community and the table.',
}

export default function StoryPage() {
  return <StoryPageContent />
}
