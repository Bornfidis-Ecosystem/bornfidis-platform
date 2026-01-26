/**
 * Offline sync service
 * Automatically syncs pending submissions when online
 */

import { saveOfflineSubmission, getPendingSubmissions, updateSubmissionStatus, deleteSubmission } from './offline-storage'

const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

let syncInProgress = false
let syncListeners: Array<(count: number) => void> = []

/**
 * Subscribe to sync status updates
 */
export function onSyncStatusChange(callback: (pendingCount: number) => void) {
  syncListeners.push(callback)
  return () => {
    syncListeners = syncListeners.filter(cb => cb !== callback)
  }
}

/**
 * Notify listeners of pending count change
 */
async function notifyListeners() {
  const pending = await getPendingSubmissions()
  syncListeners.forEach(cb => cb(pending.length))
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Submit a single submission
 */
async function submitSubmission(submission: any): Promise<boolean> {
  try {
    // Update status to syncing
    await updateSubmissionStatus(submission.id, { status: 'syncing' })

    const response = await fetch(submission.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission.payload),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // Success - delete from IndexedDB
      await deleteSubmission(submission.id)
      await notifyListeners()
      return true
    } else {
      // Failed - update error and retry count
      const error = data.error || 'Submission failed'
      await updateSubmissionStatus(submission.id, {
        status: 'pending',
        retries: submission.retries + 1,
        lastError: error,
      })
      await notifyListeners()
      return false
    }
  } catch (error: any) {
    // Network error or other exception
    const errorMessage = error.message || 'Network error'
    await updateSubmissionStatus(submission.id, {
      status: 'pending',
      retries: submission.retries + 1,
      lastError: errorMessage,
    })
    await notifyListeners()
    return false
  }
}

/**
 * Sync all pending submissions
 */
export async function syncPendingSubmissions(): Promise<{ synced: number; failed: number }> {
  if (syncInProgress) {
    return { synced: 0, failed: 0 }
  }

  if (!isOnline()) {
    return { synced: 0, failed: 0 }
  }

  syncInProgress = true

  try {
    const pending = await getPendingSubmissions()
    let synced = 0
    let failed = 0

    for (const submission of pending) {
      // Skip if max retries reached
      if (submission.retries >= MAX_RETRIES) {
        await updateSubmissionStatus(submission.id, {
          status: 'failed',
          lastError: submission.lastError || 'Max retries reached',
        })
        failed++
        continue
      }

      const success = await submitSubmission(submission)
      if (success) {
        synced++
      } else {
        failed++
      }

      // Small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    await notifyListeners()
    return { synced, failed }
  } finally {
    syncInProgress = false
  }
}

/**
 * Initialize auto-sync on online event
 */
export function initAutoSync() {
  if (typeof window === 'undefined') return

  // Sync when coming back online
  window.addEventListener('online', () => {
    syncPendingSubmissions().catch(console.error)
  })

  // Try to sync immediately if online
  if (isOnline()) {
    syncPendingSubmissions().catch(console.error)
  }

  // Periodic sync check (every 30 seconds)
  setInterval(() => {
    if (isOnline() && !syncInProgress) {
      syncPendingSubmissions().catch(console.error)
    }
  }, 30000)
}

/**
 * Submit with offline fallback
 */
export async function submitWithOfflineFallback(
  payload: Record<string, any>,
  endpoint: string
): Promise<{ success: boolean; offline?: boolean; id?: string; error?: string }> {
  // Try to submit online first
  if (isOnline()) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        // Server error - save offline
        const id = await saveOfflineSubmission(payload, endpoint)
        await notifyListeners()
        return { success: false, offline: true, id, error: data.error }
      }
    } catch (error: any) {
      // Network error - save offline
      const id = await saveOfflineSubmission(payload, endpoint)
      await notifyListeners()
      return { success: false, offline: true, id, error: error.message }
    }
  } else {
    // Offline - save to IndexedDB
    const id = await saveOfflineSubmission(payload, endpoint)
    await notifyListeners()
    return { success: false, offline: true, id }
  }
}
