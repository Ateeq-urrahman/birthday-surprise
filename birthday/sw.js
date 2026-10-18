const CACHE_NAME = 'birthday-wishes-shell-v1';
const APP_SHELL = [
  '/birthday/',
  '/birthday/style.css',
  '/birthday/script.js',
  '/birthday/manifest.webmanifest',
  '/birthday/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('birthday-wishes-shell-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin ||
      requestUrl.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate' &&
      (requestUrl.pathname === '/birthday' || requestUrl.pathname.startsWith('/birthday/'))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/birthday/', copy));
          return response;
        })
        .catch(() => caches.match('/birthday/'))
    );
    return;
  }

  if (APP_SHELL.includes(requestUrl.pathname)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
  }
});
