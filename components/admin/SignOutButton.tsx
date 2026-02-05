'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'

/**
 * Sign Out Button Component
 * Phase 2B: Client-side sign out with redirect
 */
export default function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // Phase 2AK: revoke push subscription on logout (best-effort)
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) =>
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) {
              fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: sub.endpoint }),
              }).catch(() => {})
            }
          })
        )
      }
      await signOut()
      // Call server-side signout endpoint to clear cookies
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect on error
      router.push('/admin/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:opacity-50 text-sm font-semibold"
    >
      {isSigningOut ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
