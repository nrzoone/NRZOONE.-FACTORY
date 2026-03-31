const CACHE_NAME = 'nrzone-factory-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo_black.png',
    '/logo_white.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
