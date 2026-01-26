/**
 * IndexedDB utility for storing offline submissions
 * Stores: id, payload, createdAt, retries, lastError
 */

interface OfflineSubmission {
  id: string
  payload: Record<string, any>
  endpoint: string // API endpoint to submit to
  createdAt: number // timestamp
  retries: number
  lastError: string | null
  status: 'pending' | 'syncing' | 'synced' | 'failed'
}

const DB_NAME = 'bornfidis_offline'
const DB_VERSION = 1
const STORE_NAME = 'submissions'

let db: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        objectStore.createIndex('createdAt', 'createdAt', { unique: false })
        objectStore.createIndex('status', 'status', { unique: false })
      }
    }
  })
}

/**
 * Save a submission to IndexedDB
 */
export async function saveOfflineSubmission(
  payload: Record<string, any>,
  endpoint: string
): Promise<string> {
  const database = await initDB()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const submission: OfflineSubmission = {
    id,
    payload,
    endpoint,
    createdAt: Date.now(),
    retries: 0,
    lastError: null,
    status: 'pending',
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(submission)

    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all pending submissions
 */
export async function getPendingSubmissions(): Promise<OfflineSubmission[]> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('status')
    const request = index.getAll('pending')

    request.onsuccess = () => {
      const submissions = request.result as OfflineSubmission[]
      // Also get syncing submissions that might have failed
      const syncingRequest = index.getAll('syncing')
      syncingRequest.onsuccess = () => {
        const allSubmissions = [...submissions, ...(syncingRequest.result as OfflineSubmission[])]
        resolve(allSubmissions.sort((a, b) => a.createdAt - b.createdAt))
      }
      syncingRequest.onerror = () => reject(syncingRequest.error)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all submissions (for display)
 */
export async function getAllSubmissions(): Promise<OfflineSubmission[]> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const submissions = request.result as OfflineSubmission[]
      resolve(submissions.sort((a, b) => b.createdAt - a.createdAt))
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  id: string,
  updates: Partial<Pick<OfflineSubmission, 'status' | 'retries' | 'lastError'>>
): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const submission = getRequest.result as OfflineSubmission
      if (!submission) {
        reject(new Error('Submission not found'))
        return
      }

      const updated = { ...submission, ...updates }
      const putRequest = store.put(updated)

      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Delete a submission (after successful sync)
 */
export async function deleteSubmission(id: string): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Clear all synced submissions
 */
export async function clearSyncedSubmissions(): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.openCursor()

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        const submission = cursor.value as OfflineSubmission
        if (submission.status === 'synced') {
          cursor.delete()
        }
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })
}
