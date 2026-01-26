/**
 * Offline Queue Manager
 * Phase 11G.1: Queue failed requests and retry when online
 */

const QUEUE_KEY = 'bornfidis_farmer_join_queue'
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

export interface QueuedRequest {
  id: string
  url: string
  method: string
  body: any
  retries: number
  timestamp: number
}

/**
 * Add request to offline queue
 */
export function queueRequest(url: string, method: string, body: any): void {
  try {
    const queue = getQueue()
    const request: QueuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      body,
      retries: 0,
      timestamp: Date.now(),
    }
    queue.push(request)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    console.log('Request queued:', request.id)
  } catch (error) {
    console.error('Error queueing request:', error)
  }
}

/**
 * Get all queued requests
 */
export function getQueue(): QueuedRequest[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading queue:', error)
    return []
  }
}

/**
 * Remove request from queue
 */
export function removeFromQueue(requestId: string): void {
  try {
    const queue = getQueue()
    const filtered = queue.filter(req => req.id !== requestId)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
    console.log('Request removed from queue:', requestId)
  } catch (error) {
    console.error('Error removing from queue:', error)
  }
}

/**
 * Process queued requests when online
 */
export async function processQueue(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Still offline, skipping queue processing')
    return
  }

  const queue = getQueue()
  if (queue.length === 0) {
    return
  }

  console.log(`Processing ${queue.length} queued request(s)...`)

  for (const request of queue) {
    if (request.retries >= MAX_RETRIES) {
      console.warn(`Request ${request.id} exceeded max retries, removing from queue`)
      removeFromQueue(request.id)
      continue
    }

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      })

      if (response.ok) {
        console.log(`Request ${request.id} processed successfully`)
        removeFromQueue(request.id)
      } else {
        // Increment retry count
        request.retries++
        const updatedQueue = getQueue()
        const index = updatedQueue.findIndex(req => req.id === request.id)
        if (index !== -1) {
          updatedQueue[index] = request
          localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue))
        }
        console.warn(`Request ${request.id} failed, will retry (${request.retries}/${MAX_RETRIES})`)
      }
    } catch (error) {
      // Network error, increment retry
      request.retries++
      const updatedQueue = getQueue()
      const index = updatedQueue.findIndex(req => req.id === request.id)
      if (index !== -1) {
        updatedQueue[index] = request
        localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue))
      }
      console.error(`Request ${request.id} error, will retry (${request.retries}/${MAX_RETRIES}):`, error)
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

/**
 * Initialize offline queue processing
 * Call this on app load and when coming back online
 */
export function initOfflineQueue(): void {
  // Process queue on load if online
  if (navigator.onLine) {
    processQueue()
  }

  // Process queue when coming back online
  window.addEventListener('online', () => {
    console.log('Back online, processing queue...')
    setTimeout(() => processQueue(), RETRY_DELAY)
  })
}
