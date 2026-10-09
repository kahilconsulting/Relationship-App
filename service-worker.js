/* Connect Better — simple offline support.
   Always tries the internet first, so updates show up straight away.
   If there is no connection, it falls back to the copy saved on the device. */

const CACHE = 'connect-better';

const FILES = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'data/questions.json',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  const freshFiles = FILES.map((file) => new Request(file, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(freshFiles)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  // 'no-cache' makes the browser check with the server every time instead of
  // reusing its own stored copy, which GitHub Pages lets it keep for 10 minutes.
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
