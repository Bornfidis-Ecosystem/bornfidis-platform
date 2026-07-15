'use client'

import { useEffect } from 'react'

import DigitalStudioPageContent from '@/components/digital-studio/DigitalStudioPageContent'

/** Dedicated apply URL — same pilot page, scrolls to the application form. */
export default function DigitalStudioApplyClient() {
  useEffect(() => {
    const el = document.getElementById('apply')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return <DigitalStudioPageContent />
}
