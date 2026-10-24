/*
 * Raah service worker.
 * Caches the app shell and all local assets so the demo works offline.
 * Uses a versioned cache name; bump CACHE_VERSION to invalidate old assets.
 * No user data is cached (the MVP has no account system).
 */
const CACHE_VERSION = 'raah-v2';
const CACHE_NAME = `${CACHE_VERSION}-shell`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/favicon.svg',
  '/logo.svg',
  '/logo-mono.svg',
  '/icons/raah-icon-192.png',
  '/icons/raah-icon-512.png',
  '/icons/raah-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first so deploys take effect, with the
  // cached shell as fallback and offline.html as the last resort.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached ?? caches.match('/offline.html'))
            .then((cached) => cached ?? Response.error()),
        ),
    );
    return;
  }

  // Same-origin assets: cache-first, then network (and cache the result).
  // No offline.html fallback here — a missing JS/CSS asset should surface
  // as its real network response, not as an HTML page.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
