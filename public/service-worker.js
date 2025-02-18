const CACHE_NAME = 'pdf-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/pdf.worker.mjs',
  'https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js', // 确保使用 jsDelivr
  'https://cdn.jsdelivr.net/npm/react-pdf@5.7.2/dist/esm/entry.webpack.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      // 仅对 urlsToCache 数组里的 URL 进行缓存，并输出日志记录每个资源的缓存结果
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url)
            .then(() => {
              console.log('Cached successfully:', url);
              return { url, success: true };
            })
            .catch(error => {
              console.error('Failed to cache:', url, error);
              return { url, success: false, error: error.toString() };
            })
        )
      ).then(results => {
        console.log('Cache results:', results);
        // 只根据 urlsToCache 的结果来判断离线是否就绪
        const failedResults = results.filter(result => !result.success);
        const offlineReady = failedResults.length === 0;
        console.log('Offline ready:', offlineReady);

        // 发送消息给所有客户端，其中只包含 urlsToCache 的缓存结果
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            const message = {
              type: 'offline-ready',
              message: offlineReady
                ? 'All assets are cached and offline mode is enabled.'
                : 'Some assets failed to cache. Offline mode may not be fully available.',
              failedResources: failedResults
            };
            console.log('Sending offline-ready message to client:', JSON.stringify(message, null, 2));
            client.postMessage(message);
          });
        });
      });
    })
  );
});

self.addEventListener('fetch', event => {
  console.log(`[Service Worker] Fetching: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then(response => {
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