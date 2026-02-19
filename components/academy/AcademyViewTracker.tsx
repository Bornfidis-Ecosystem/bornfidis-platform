'use client'

import { useEffect } from 'react'
import { trackAcademyView } from '@/lib/academy-analytics'

/** Fires academy_view when mounted (e.g. on /academy page). */
export function AcademyViewTracker() {
  useEffect(() => {
    trackAcademyView()
  }, [])
  return null
}
