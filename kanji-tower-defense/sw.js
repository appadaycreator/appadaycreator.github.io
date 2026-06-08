const CACHE_NAME = 'kanji-tower-defense-v1.6.0';
const STATIC_ASSETS = [
    '/kanji-tower-defense/',
    '/kanji-tower-defense/index.html',
    '/kanji-tower-defense/main.js',
    '/kanji-tower-defense/style.css',
    '/kanji-tower-defense/words.js',
    '/kanji-tower-defense/manifest.json',
    '/kanji-tower-defense/icon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    // CDNや外部リソースはキャッシュしない
    if (url.hostname !== self.location.hostname) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.status === 200 && url.pathname.startsWith('/kanji-tower-defense/')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // オフラインフォールバック
                if (event.request.mode === 'navigate') {
                    return caches.match('/kanji-tower-defense/index.html');
                }
            });
        })
    );
});
