// Web Push service worker. Runs independently of the React app, so it's
// plain JS at the site root (not bundled by Vite) — this is the only file
// the browser will actually invoke to handle a push arriving while the site
// isn't open in a tab.

// Without these, an already-installed service worker stays active
// indefinitely (browsers don't auto-swap a running SW for a new version
// until every tab using it closes) — so an icon/path fix here would look
// like it "did nothing" until skipWaiting/clients.claim force the new
// version to take over immediately.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Kaiira', body: event.data.text() }
  }

  const { title = 'Kaiira', body = '', url = '/' } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
