// ============================================================
// Soul Wallet — Service Worker
// Enables: offline capability, push notifications, background sync
// ============================================================

const CACHE_NAME = 'soul-wallet-v1'
const STATIC_CACHE = 'soul-wallet-static-v1'
const API_CACHE = 'soul-wallet-api-v1'

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/travel',
  '/trade',
  '/gaming',
  '/miles',
  '/offline',
  '/manifest.json',
]

// API routes to cache with network-first strategy
const API_CACHE_ROUTES = [
  '/api/wallet/balance',
  '/api/miles/balance',
  '/api/trade/bots',
]

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache failed for some assets:', err)
      })
    })
  )
  self.skipWaiting()
})

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// ── Fetch Strategy ────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // API routes: Network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    if (API_CACHE_ROUTES.some(route => url.pathname.startsWith(route))) {
      event.respondWith(networkFirstWithCache(request))
    }
    return
  }

  // Static assets: Cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|svg|woff2|ico)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirstWithNetwork(request))
    return
  }

  // Navigation: Network first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }
})

async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request.clone())
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await caches.match(request)
    return cached || new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch {
    return new Response('Asset unavailable offline', { status: 503 })
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return caches.match('/offline') || new Response(
      '<html><body style="background:#000;color:#D4AF37;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column"><h1>◆</h1><p>Soul Wallet is offline</p><p style="opacity:0.5;font-size:12px">Your balance and data will sync when you reconnect</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'dustify-notification',
    renotify: data.urgent || false,
    requireInteraction: data.urgent || false,
    data: { url: data.url || '/dashboard' },
    actions: data.actions || [],
    vibrate: data.urgent ? [200, 100, 200] : [100],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Soul Wallet', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trades') {
    event.waitUntil(syncPendingTrades())
  }
  if (event.tag === 'sync-miles') {
    event.waitUntil(syncDustMiles())
  }
})

async function syncPendingTrades() {
  // Sync any queued trades that failed while offline
  console.log('[SW] Syncing pending trades...')
}

async function syncDustMiles() {
  console.log('[SW] Syncing DustMiles...')
}
