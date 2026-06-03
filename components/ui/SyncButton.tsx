'use client'

import { useState, useEffect } from 'react'
import { syncPendingSubmissions, onSyncStatusChange, isOnline } from '@/lib/offline-sync'
import { toast } from './Toast'

export function SyncButton() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // Check initial online status
    setOnline(isOnline())

    // Listen for online/offline events
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Subscribe to pending count changes
    const unsubscribe = onSyncStatusChange((count) => {
      setPendingCount(count)
    })

    // Initial count check
    syncPendingSubmissions().then(() => {
      // Count will be updated via listener
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribe()
    }
  }, [])

  const handleSync = async () => {
    if (!online) {
      toast.warning('You are currently offline. Please check your connection.')
      return
    }

    if (pendingCount === 0) {
      toast.info('No pending submissions to sync.')
      return
    }

    setIsSyncing(true)
    try {
      const result = await syncPendingSubmissions()
      
      if (result.synced > 0) {
        toast.success(`Successfully synced ${result.synced} submission${result.synced > 1 ? 's' : ''}.`)
      }
      
      if (result.failed > 0) {
        toast.error(`${result.failed} submission${result.failed > 1 ? 's' : ''} failed to sync.`)
      }
      
      if (result.synced === 0 && result.failed === 0) {
        toast.info('No pending submissions to sync.')
      }
    } catch (error: any) {
      toast.error('Error syncing submissions: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSyncing(false)
    }
  }

  if (pendingCount === 0 && online) {
    return null // Don't show button if nothing to sync and online
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !online}
      className={`
        fixed bottom-4 right-4 z-40
        px-4 py-2 rounded-lg shadow-lg
        font-semibold text-sm
        transition-all
        ${online && pendingCount > 0
          ? 'bg-forestDark text-white hover:bg-opacity-90'
          : 'bg-gray-400 text-white cursor-not-allowed'
        }
        ${isSyncing ? 'opacity-50 cursor-wait' : ''}
      `}
      title={
        !online
          ? 'You are offline'
          : pendingCount > 0
          ? `Sync ${pendingCount} pending submission${pendingCount > 1 ? 's' : ''}`
          : 'No pending submissions'
      }
    >
      {isSyncing ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          Syncing...
        </span>
      ) : !online ? (
        <span className="flex items-center gap-2">
          <span>📴</span>
          Offline
        </span>
      ) : pendingCount > 0 ? (
        <span className="flex items-center gap-2">
          <span>🔄</span>
          Sync ({pendingCount})
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span>✓</span>
          Synced
        </span>
      )}
    </button>
  )
}
