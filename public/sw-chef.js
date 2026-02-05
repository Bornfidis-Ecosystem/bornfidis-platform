/**
 * Phase 2AH — Service Worker for chef offline.
 * Phase 2AK — Web Push: show notification and open URL on click.
 */
const CACHE_NAME = 'chef-offline-v1'
const CHEF_PREFIX = '/chef'

function isChefRequest(url) {
  try {
    const path = new URL(url).pathname
    return path === CHEF_PREFIX || path.startsWith(CHEF_PREFIX + '/')
  } catch {
    return false
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!isChefRequest(event.request.url)) return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        if (response.status === 200 && response.type === 'basic') {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' }))
      )
  )
})

// Phase 2AK: push notification
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = { title: 'Bornfidis', body: '', url: '/' }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    data.body = event.data.text() || ''
  }
  const opts = {
    body: data.body,
    tag: data.tag || 'default',
    data: { url: data.url || '/' },
    requireInteraction: false,
  }
  event.waitUntil(self.registration.showNotification(data.title, opts))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  let url = event.notification.data?.url || '/chef'
  if (url.startsWith('/')) url = self.location.origin + url
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const wc of windowClients) {
        if (wc.url.startsWith(self.location.origin) && (wc.url.includes('/chef') || wc.url.includes('/admin'))) {
          wc.focus()
          wc.navigate(url)
          return
        }
      }
      if (clients.openWindow) clients.openWindow(url)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
})
