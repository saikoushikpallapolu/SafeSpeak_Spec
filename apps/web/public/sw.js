// SafeSpeak Service Worker for Offline & Shell Caching
const CACHE_NAME = 'safespeak-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/leaf.svg',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Only cache GET requests, bypass API & socket endpoints
  if (event.request.method !== 'GET' || event.request.url.includes('/socket.io') || event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const toCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache)
        })
        return response
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })
    })
  )
})
