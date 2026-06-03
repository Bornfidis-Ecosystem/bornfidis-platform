import type { Metadata } from 'next'

import JournalPage from '@/components/journal/JournalPage'
import '@/components/journal/journal.css'

export const metadata: Metadata = {
  title: 'Journal — Bornfidis',
  description:
    'Notes from the kitchen. Seasonal recipes, sourcing stories, provision updates, and dispatches from the Bornfidis table in Vermont and Jamaica.',
}

export default function JournalRoute() {
  return <JournalPage />
}
