var log = console.log.bind(console);
var err = console.error.bind(console);

var version = '2';
var cacheName = 'pwa-freitagtraining-v' + version;
var dataCacheName = 'pwa-freitagtraining-data-v' + version;
var appShellFilesToCache = [
  './',
  './index.html',
  './inline.d9955bd378f044a74e3e.bundle.js',
  './main.d2cd6bc2954cdcb804a7.bundle.js',
  './polyfills.a826c616902ba35dd8ef.bundle.js',
  './styles.b0e114c891ad3843b53e.bundle.css',
  './vendor.7d70e606e2354f599659.bundle.js',
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

  } else {

    // The old code for App Shell
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
