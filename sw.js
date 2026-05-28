/**
 * Service Worker - Digital Business Card
 * Cache version must be incremented when static assets change.
 */
const CACHE_NAME = 'dbc-gm-v15';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './data/card.json',
  './data/labels.json',
  './styles/main.css',
  './styles/card.css',
  './styles/modal.css',
  './styles/responsive.css',
  './scripts/focus-trap.js',
  './scripts/modal-handler.js',
  './scripts/qr-handler.js',
  './scripts/copy-handler.js',
  './scripts/vcard-handler.js',
  './scripts/share-handler.js',
  './scripts/card-renderer.js',
  './scripts/install-banner.js?v=2',
  './scripts/theme-handler.js',
  './scripts/language-handler.js',
  './scripts/video-handler.js',
  './scripts/app.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/favicon.svg',
  './assets/owner.webp',
  './assets/MYQR.png',
  './assets/bacground7.png',
  './assets/bacground7_dark.png',
  './assets/owner-fallback.svg',
  './assets/qr-fallback.svg',
  './assets/background-fallback.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
