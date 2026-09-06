// CARIEARSA High-Performance Cache Engine (2026)
const CACHE_NAME = 'cariearsa-media-v2026.3';

const CRITICAL_INTRO_ASSETS = [
  '/assets/girl.avif',
  '/public/assets/girl.avif'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_INTRO_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ONLY cache large media girl.avif - let browser & Vite handle all code, CSS, and HTML natively
  if (req.method === 'GET' && url.pathname.includes('girl.avif')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          fetch(req).then((fresh) => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, fresh));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }
});
