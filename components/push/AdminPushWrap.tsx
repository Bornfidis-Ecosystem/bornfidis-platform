'use client'

import { useEffect } from 'react'
import PushOptIn from './PushOptIn'

/**
 * Phase 2AK — Register same Service Worker (push + cache) for admin so admins receive push.
 */
export default function AdminPushWrap() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-chef.js').catch(() => {})
    }
  }, [])

  return <PushOptIn />
}
