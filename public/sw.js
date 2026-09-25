// PWA service worker — handles Web Push (still the primary reason this
// file exists) and a light same-origin runtime cache so previously visited
// pages/assets keep working offline. Plain JS at the site root (not bundled
// by Vite) since the browser needs a stable, unbundled URL to install it.

const CACHE_NAME = 'kaiira-cache-v1'

// Without these, an already-installed service worker stays active
// indefinitely (browsers don't auto-swap a running SW for a new version
// until every tab using it closes) — so a fix here would look like it "did
// nothing" until skipWaiting/clients.claim force the new version to take
// over immediately. Old cache versions are swept on activate too.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
    ])
  )
})

// Network-first, falling back to cache when offline — never touches
// non-GET requests (cart/checkout/payment mutations) or cross-origin ones
// (the API, Razorpay's script, image CDNs), so those always go over the
// network untouched and this only ever affects the app's own static shell.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request))
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Kaiira', body: event.data.text() }
  }

  const { title = 'Kaiira', body = '', url = '/', image, actions } = payload

  // Each action button carries its own optional target url (falling back to
  // the notification's own), but the Notification API's `actions` option
  // only accepts {action, title, icon} — so the per-action urls are kept
  // separately in `data` and looked up by action id on click instead.
  const hasActions = Array.isArray(actions) && actions.length > 0
  const notificationActions = hasActions
    ? actions.map((a) => ({ action: a.action, title: a.title, icon: a.icon }))
    : undefined
  const actionUrls = hasActions
    ? Object.fromEntries(actions.map((a) => [a.action, a.url || url]))
    : undefined

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      image: image || undefined,
      actions: notificationActions,
      data: { url, actionUrls },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const { url = '/', actionUrls } = event.notification.data || {}
  const targetUrl = (event.action && actionUrls && actionUrls[event.action]) || url

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
