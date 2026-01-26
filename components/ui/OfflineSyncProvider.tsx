'use client'

import { useEffect } from 'react'
import { initAutoSync } from '@/lib/offline-sync'

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auto-sync when component mounts
    initAutoSync()
  }, [])

  return <>{children}</>
}
