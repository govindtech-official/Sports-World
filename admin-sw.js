const CACHE_NAME = 'sports-world-admin-shell-v1';
const APP_SHELL = [
  '/admin-app',
  '/admin.webmanifest',
  '/styles.css',
  '/features.css',
  '/script.js',
  '/assets/admin-icon-192.png',
  '/assets/admin-icon-512.png',
  '/assets/sports-world-logo-source.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('sports-world-admin-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (!APP_SHELL.includes(url.pathname)) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(url.pathname, response.clone()));
    return response;
  }).catch(async () => (await caches.match(url.pathname)) || Response.error()));
});
