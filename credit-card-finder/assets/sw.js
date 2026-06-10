// Service Worker for Credit Card Finder PWA
const CACHE_NAME = 'credit-card-finder-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/credit-card-finder/',
  '/credit-card-finder/index.html',
  '/credit-card-finder/assets/app.js',
  '/credit-card-finder/assets/cards.js',
  '/credit-card-finder/assets/styles.css',
  '/credit-card-finder/manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // キャッシュ追加失敗時も続行（オフライン対応の基本機能は損なわない）
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // GET リクエストのみキャッシュ戦略を適用
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        // 無効なレスポンスの場合はキャッシュしない
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache).catch(() => {});
        });
        return response;
      }).catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request);
      });
    })
  );
});
