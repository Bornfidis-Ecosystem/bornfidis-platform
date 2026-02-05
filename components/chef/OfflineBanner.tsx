'use client'

import { useChefOffline } from './ChefOfflineProvider'

/**
 * Phase 2AH — Offline banner and sync controls for chef area.
 * Shows "You're offline — changes will sync" when offline;
 * when online with pending queue, shows sync spinner and Retry.
 */
export default function OfflineBanner() {
  const ctx = useChefOffline()
  if (!ctx) return null

  const { isOnline, isSyncing, queueLength, retrySync } = ctx

  if (isOnline && queueLength === 0 && !isSyncing) return null

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-2 text-sm bg-amber-100 text-amber-900 border-b border-amber-200"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        {!isOnline ? (
          <span className="font-medium">You&apos;re offline — changes will sync when you&apos;re back online.</span>
        ) : isSyncing ? (
          <>
            <span className="inline-block h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin flex-shrink-0" aria-hidden />
            <span>Syncing…</span>
          </>
        ) : queueLength > 0 ? (
          <span>{queueLength} change{queueLength !== 1 ? 's' : ''} waiting to sync.</span>
        ) : null}
      </div>
      {isOnline && (queueLength > 0 || ctx.lastSyncResult) && !isSyncing && (
        <button
          type="button"
          onClick={retrySync}
          className="flex-shrink-0 rounded px-3 py-1.5 bg-amber-600 text-white font-medium hover:bg-amber-700"
        >
          Retry sync
        </button>
      )}
    </div>
  )
}
