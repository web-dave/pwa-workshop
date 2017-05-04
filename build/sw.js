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

self.addEventListener('push', function (event) {
  log('[Service Worker]: Received push event')

  var notificationData = {}

  if (event.data) {
    notificationData = event.data.json().notification; // "notification node is specific for @angular/service-worker
  } else {
    notificationData = {
      title: 'Something Has Happened',
      message: 'Something you might want to check out',
      icon: '/assets/images/logo.png'
    }
  }

  self.registration.showNotification(notificationData.title, notificationData);
})
