'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  addToQueue as addToQueueDb,
  getQueue,
  getQueueLength,
  removeQueuedItem,
  isStale as checkStale,
  getCached,
  setCached,
  type QueueItemType,
} from '@/lib/chef-offline'
import { updatePrep, updateChefStatus } from '@/app/chef/bookings/actions'
import { setDayAvailability } from '@/app/chef/availability/actions'
import type { ChefBookingStatus } from '@prisma/client'

type SyncResult = { synced: number; failed: number; serverWins: number }

type ChefOfflineContextValue = {
  isOnline: boolean
  isSyncing: boolean
  queueLength: number
  lastSyncResult: SyncResult | null
  addToQueue: (type: QueueItemType, payload: Record<string, unknown>) => Promise<string>
  retrySync: () => Promise<void>
  isStale: (fetchedAt: number) => boolean
  getCached: typeof getCached
  setCached: typeof setCached
  refreshQueueLength: () => Promise<void>
}

const ChefOfflineContext = createContext<ChefOfflineContextValue | null>(null)

export function useChefOffline() {
  const ctx = useContext(ChefOfflineContext)
  return ctx
}

async function replayQueue(): Promise<SyncResult> {
  const items = await getQueue()
  const result: SyncResult = { synced: 0, failed: 0, serverWins: 0 }
  for (const item of items) {
    try {
      if (item.type === 'prep_update') {
        const { bookingId, completed } = item.payload as { bookingId: string; completed: Record<string, boolean> }
        const res = await updatePrep(bookingId, completed)
        if (res.success) {
          await removeQueuedItem(item.id)
          result.synced++
        } else {
          await removeQueuedItem(item.id)
          result.serverWins++
        }
      } else if (item.type === 'status_update') {
        const { assignmentId, newStatus } = item.payload as { assignmentId: string; newStatus: ChefBookingStatus }
        const res = await updateChefStatus(assignmentId, newStatus)
        if (res.success) {
          await removeQueuedItem(item.id)
          result.synced++
        } else {
          await removeQueuedItem(item.id)
          result.serverWins++
        }
      } else if (item.type === 'availability_update') {
        const { chefId, date, available, note } = item.payload as {
          chefId: string
          date: string
          available: boolean
          note?: string | null
        }
        const res = await setDayAvailability(chefId, date, available, note ?? null)
        if (res.success) {
          await removeQueuedItem(item.id)
          result.synced++
        } else {
          await removeQueuedItem(item.id)
          result.serverWins++
        }
      }
    } catch {
      result.failed++
      await removeQueuedItem(item.id)
    }
  }
  return result
}

export function ChefOfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [queueLength, setQueueLength] = useState(0)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  const refreshQueueLength = useCallback(async () => {
    const len = await getQueueLength()
    setQueueLength(len)
  }, [])

  const syncNow = useCallback(async () => {
    const len = await getQueueLength()
    if (len === 0) {
      setLastSyncResult(null)
      return
        }
    setIsSyncing(true)
    setLastSyncResult(null)
    try {
      const result = await replayQueue()
      setLastSyncResult(result)
      await refreshQueueLength()
      if (result.synced > 0) {
        toast.success(result.synced === 1 ? '1 change synced' : `${result.synced} changes synced`)
      }
      if (result.serverWins > 0) {
        toast.error(
          result.serverWins === 1
            ? 'Server has newer data — 1 change was not applied.'
            : `Server has newer data — ${result.serverWins} changes were not applied.`
        )
      }
      if (result.failed > 0) {
        toast.error(`Sync failed for ${result.failed} change(s). Try again.`)
      }
    } finally {
      setIsSyncing(false)
    }
  }, [refreshQueueLength])

  const retrySync = useCallback(async () => {
    if (!isOnline) {
      toast.error('You\'re offline. Connect to sync.')
      return
    }
    await syncNow()
  }, [isOnline, syncNow])

  const addToQueue = useCallback(
    async (type: QueueItemType, payload: Record<string, unknown>) => {
      const id = await addToQueueDb(type, payload)
      await refreshQueueLength()
      return id
    },
    [refreshQueueLength]
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }
    const handleOffline = () => {
      setIsOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    refreshQueueLength()
  }, [refreshQueueLength])

  useEffect(() => {
    if (isOnline && queueLength > 0 && !isSyncing) {
      syncNow()
    }
  }, [isOnline, queueLength, isSyncing, syncNow])

  const value: ChefOfflineContextValue = {
    isOnline,
    isSyncing,
    queueLength,
    lastSyncResult,
    addToQueue,
    retrySync,
    isStale: checkStale,
    getCached,
    setCached,
    refreshQueueLength,
  }

  return (
    <ChefOfflineContext.Provider value={value}>
      {children}
    </ChefOfflineContext.Provider>
  )
}
