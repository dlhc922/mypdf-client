const CACHE_NAME = 'pdf-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/pdf.worker.mjs',
  'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js',
  'https://cdn.jsdelivr.net/npm/react-pdf@5.7.2/dist/esm/entry.webpack.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return Promise.all(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.error('Failed to cache:', url, error);
              return Promise.resolve();
            })
          )
        );
      })
  );
});

self.addEventListener('fetch', event => {
  console.log(`[Service Worker] Fetching: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log(`[Service Worker] Found in cache: ${event.request.url}`);
          return response;
        }
        console.log(`[Service Worker] Not found in cache: ${event.request.url}`);
        return fetch(event.request).catch(error => {
          console.error('[Service Worker] Fetch failed for:', event.request.url, error);
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting outdated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 