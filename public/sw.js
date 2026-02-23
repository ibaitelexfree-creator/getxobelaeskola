const CACHE_NAME = 'getxo-bela-cache-v1';
const GLOSSARY_CACHE = 'glosario-v1';
const CALCULATOR_CACHE = 'calculadoras-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (![CACHE_NAME, GLOSSARY_CACHE, CALCULATOR_CACHE].includes(name)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NetworkFirst for /api/glosario
  if (url.pathname.includes('/api/glosario')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(GLOSSARY_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // CacheFirst for calculators
  if (
    url.pathname.includes('/academy/tools/chart-plotter') ||
    url.pathname.includes('/academy/tools/wind-lab') ||
    url.pathname.includes('calculator') ||
    url.pathname.includes('calculadora')
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CALCULATOR_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }
});
