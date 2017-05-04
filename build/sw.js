var log = console.log.bind(console);
var err = console.error.bind(console);

var version = '2';
var cacheName = 'pwa-freitagtraining-v' + version;
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
});

self.addEventListener('fetch', (event) => {
  log('[Service Worker]: Fetch');
});
