// build/sw.js
var log = console.log.bind(console);
var err = console.error.bind(console);

self.addEventListener('install', (event) => {
  log('[Service Worker]: Installed');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  log('[Service Worker]: Active');

  self.clients.matchAll({
    includeUncontrolled: true
  })
    .then(function (clientList) {
      var urls = clientList.map(function (client) {
        return client.url;
      });
      log('[Service Worker]: Matching clients:', urls.join(', '));
    });

  event.waitUntil(self.clients.claim());
});
