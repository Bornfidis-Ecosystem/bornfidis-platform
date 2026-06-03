import type { Metadata } from 'next'

import StoryPage from '@/components/story/StoryPage'
import '@/components/story/our-story.css'

export const metadata: Metadata = {
  title: 'Our Story — Bornfidis',
  description:
    'Brian Maylor spent 13 years with Royal Caribbean — rising from Culinary Trainee to Chef de Partie, then to Level 5 Waiter Lead on Azamara and Harmony of the Seas. Bornfidis is what those years made possible.',
}

export default function OurStoryPage() {
  return <StoryPage />
}
