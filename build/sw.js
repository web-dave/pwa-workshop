var log = console.log.bind(console);
var err = console.error.bind(console);

var version = '2';
var cacheName = 'pwa-freitagtraining-v' + version;
var dataCacheName = 'pwa-freitagtraining-data-v' + version;
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

  // Match requests for data and handle them separately
  if (event.request.url.indexOf('timeline/') != -1) {
    event.respondWith(

      // Network-First Strategy
      fetch(event.request)
        .then((response) => {
          return caches.open(dataCacheName).then((cache) => {

            cache.put(event.request.url, response.clone());
            log('[Service Worker]: Fetched & Cached URL using network-first', event.request.url);
            return response.clone();
          });
        })
        .catch((error) => {
          log('[Service Worker]: Returning from cache', event.request.url);
          return caches.match(event.request).then((response) => {
            return response;
          });
        })

    );
  } else if (event.request.url.indexOf('fonts.googleapis.com') != -1 || event.request.url.indexOf('fonts.gstatic.com') != -1 || event.request.url.indexOf('pbs.twimg.com') != -1) {
    event.respondWith(

      // Cache-First Strategy
      caches.match(event.request.clone()).then((response) => {
        return response || fetch(event.request.clone()).then((r2) => {
            return caches.open(dataCacheName).then((cache) => {
              console.log('[Service Worker]: Fetched & Cached URL using cache-first', event.request.url);
              cache.put(event.request.url, r2.clone());
              return r2.clone();
            });
          });
      })

    );
  } else {

    // The old code for App Shell
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

