'use client'

import { useEffect } from 'react'
import { ChefOfflineProvider } from './ChefOfflineProvider'
import OfflineBanner from './OfflineBanner'
import PushOptIn from '@/components/push/PushOptIn'

/**
 * Phase 2AH — Wraps chef area with offline provider and banner.
 * Phase 2AK — Registers Service Worker (cache + push) and opt-in prompt.
 */
export default function ChefOfflineWrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-chef.js').catch(() => {})
    }
  }, [])

  return (
    <ChefOfflineProvider>
      <OfflineBanner />
      <PushOptIn />
      {children}
    </ChefOfflineProvider>
  )
}
