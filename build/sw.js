var log = console.log.bind(console);
var err = console.error.bind(console);

var version = '2';
var cacheName = 'pwa-freitagtraining-v' + version;
var appShellFilesToCache = [
  './',
  './index.html',
  './inline.9b502c297169a277d5fb.bundle.js',
  './main.7076b51032c778e38a8b.bundle.js',
  './polyfills.a826c616902ba35dd8ef.bundle.js',
  './styles.b0e114c891ad3843b53e.bundle.css',
  './vendor.331882c5745789983b16.bundle.js',
  './favicon.ico',
  './assets/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
  log('[Service Worker]: Installed');

  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      log('[Service Worker]: Caching App Shell');
      return cache.addAll(appShellFilesToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  log('[Service Worker]: Active');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          log('[Service Worker]: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  log('[Service Worker]: Fetch');
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        log('[Service Worker]: returning ' + event.request.url + 'from cache');
        return response;
      } else {
        log('[Service Worker]: returning ' + event.request.url + 'from net');
        return fetch(event.request);
      }

      // w/o debug info:
      // return response || fetch(event.request);
    })
  );
});
