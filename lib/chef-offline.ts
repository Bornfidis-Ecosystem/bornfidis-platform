/**
 * Phase 2AH — Offline-friendly mode for Chefs.
 * IndexedDB: sync queue (replay on reconnect) + optional cache (stale >24h = read-only).
 */

const DB_NAME = 'chef_offline_v1'
const DB_VERSION = 1
const STORE_QUEUE = 'queue'
const STORE_CACHE = 'cache'
const STALE_MS = 24 * 60 * 60 * 1000 // 24h

export type QueueItemType = 'prep_update' | 'status_update' | 'availability_update'

export type QueueItem = {
  id: string
  type: QueueItemType
  payload: Record<string, unknown>
  createdAt: number
}

export type CacheEntry = {
  data: unknown
  fetchedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const q = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' })
        q.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'key' })
      }
    }
  })
}

export function isStale(fetchedAt: number): boolean {
  return Date.now() - fetchedAt > STALE_MS
}

/** Add an action to the sync queue. */
export async function addToQueue(
  type: QueueItemType,
  payload: Record<string, unknown>
): Promise<string> {
  const db = await openDB()
  const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const item: QueueItem = { id, type, payload, createdAt: Date.now() }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readwrite')
    const store = tx.objectStore(STORE_QUEUE)
    const req = store.add(item)
    req.onsuccess = () => { db.close(); resolve(id) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

/** Get all queued items (ordered by createdAt). */
export async function getQueue(): Promise<QueueItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readonly')
    const store = tx.objectStore(STORE_QUEUE)
    const index = store.index('createdAt')
    const req = index.getAll()
    req.onsuccess = () => {
      db.close()
      resolve((req.result as QueueItem[]) || [])
    }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

export async function getQueueLength(): Promise<number> {
  const items = await getQueue()
  return items.length
}

/** Remove a single item from the queue (after successful sync or server-wins). */
export async function removeQueuedItem(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readwrite')
    tx.objectStore(STORE_QUEUE).delete(id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

/** Clear the entire queue (e.g. after full sync). */
export async function clearQueue(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readwrite')
    tx.objectStore(STORE_QUEUE).clear()
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

/** Get cached data for a key. Returns null if missing. */
export async function getCached<T = unknown>(key: string): Promise<{ data: T; fetchedAt: number } | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, 'readonly')
    const req = tx.objectStore(STORE_CACHE).get(key)
    req.onsuccess = () => {
      db.close()
      const raw = req.result as { key: string; data: T; fetchedAt: number } | undefined
      if (!raw) return resolve(null)
      resolve({ data: raw.data, fetchedAt: raw.fetchedAt })
    }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

/** Set cached data for a key. */
export async function setCached(key: string, data: unknown): Promise<void> {
  const db = await openDB()
  const entry = { key, data, fetchedAt: Date.now() }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, 'readwrite')
    tx.objectStore(STORE_CACHE).put(entry)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}
