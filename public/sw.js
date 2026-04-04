// ============================================================
// SOUL WALLET PWA — Service Worker v2.0
// Dustify Technologies Corp · Edmonton, Alberta, Canada
// ============================================================
const CACHE_V = 'v2.0'
const STATIC  = `sw-static-${CACHE_V}`
const API_C   = `sw-api-${CACHE_V}`
const IMG_C   = `sw-img-${CACHE_V}`
const FONT_C  = `sw-font-${CACHE_V}`

const PRECACHE = ['/','/dashboard','/travel','/trade','/gaming','/miles','/vault','/send','/receive','/redeem','/settings','/notifications','/manifest.json']
const API_PATHS = ['/api/wallet/','/api/miles/','/api/bots/','/api/travel/','/api/gaming/']

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(STATIC)
    await Promise.allSettled(PRECACHE.map(u => c.add(u).catch(() => null)))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => !k.endsWith(CACHE_V)).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) return
  if (API_PATHS.some(p => url.pathname.startsWith(p))) {
    e.respondWith(networkFirst(e.request, API_C, 30000))
    return
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(cacheFirst(e.request, FONT_C))
    return
  }
  if (/\.(png|jpg|jpeg|gif|webp|avif|svg|ico)/.test(url.pathname)) {
    e.respondWith(cacheFirst(e.request, IMG_C))
    return
  }
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(cacheFirst(e.request, STATIC))
    return
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(staleWhileRevalidate(e.request, STATIC))
    return
  }
  e.respondWith(networkFirst(e.request, STATIC, 10000))
})

async function cacheFirst(req, name) {
  const hit = await caches.match(req)
  if (hit) return hit
  try {
    const res = await fetch(req)
    if (res.ok) (await caches.open(name)).put(req, res.clone())
    return res
  } catch { return new Response('Offline', { status: 503 }) }
}

async function networkFirst(req, name, ms) {
  try {
    const ctrl = new AbortController()
    const tid = setTimeout(() => ctrl.abort(), ms)
    const res = await fetch(req, { signal: ctrl.signal })
    clearTimeout(tid)
    if (res.ok) (await caches.open(name)).put(req, res.clone())
    return res
  } catch {
    const hit = await caches.match(req)
    return hit ?? new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name)
  const hit = await cache.match(req)
  const revalidate = fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); return r }).catch(() => null)
  return hit ?? await revalidate ?? new Response('Offline', { status: 503 })
}

self.addEventListener('push', e => {
  if (!e.data) return
  let p; try { p = e.data.json() } catch { p = { title: 'Soul Wallet', body: e.data.text() } }
  e.waitUntil(self.registration.showNotification(p.title ?? 'Soul Wallet', {
    body: p.body ?? '', icon: '/icons/icon-192.png', badge: '/icons/icon-72.png',
    tag: p.tag ?? 'soul-wallet', requireInteraction: !!p.urgent,
    vibrate: p.urgent ? [200,100,200] : [100],
    data: { url: p.actionUrl ?? '/dashboard' },
  }))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/dashboard'
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const ex = cs.find(c => c.url === url)
    return ex ? ex.focus() : self.clients.openWindow(url)
  }))
})

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (e.data?.type === 'CLEAR_CACHE') caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))))
})
