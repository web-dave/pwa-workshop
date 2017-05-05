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
  log('[Service Worker]: Received push event');

  var notificationData = {};

  if (event.data) {
    notificationData = event.data.json().notification; // "notification node is specific for @angular/service-worker
  } else {
    notificationData = {
      title: 'Something Has Happened',
      message: 'Something you might want to check out',
      icon: '/assets/images/logo.png'
    };
  }

  self.registration.showNotification(notificationData.title, notificationData);
});

self.addEventListener('notificationclick', function (event) {
  log('[Service Worker]: Received notificationclick event', event);

  event.notification.close();

  if (event.action == 'opentweet') {
    log('[Service Worker]: Performing action opentweet');

    event.waitUntil(
      clients.openWindow(event.notification.data).then(function (windowClient) {
        // do something with the windowClient.
      })
    );
  } else {
    log('[Service Worker]: Performing default click action');

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(

      clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
      })
        .then(function (clientList) {
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i]
            if (client.url == '/' && 'focus' in client)
              return client.focus();
          }
          if (clients.openWindow)
            return clients.openWindow('/');
        }));
  }
});

self.addEventListener('notificationclose', function (event) {
  log('[Service Worker]: Received notificationclose event');
});

self.addEventListener('sync', function (event) {
  log('[Service Worker]: Received sync event', event.tag);
});

