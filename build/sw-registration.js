const vapidPublicKey = 'BK0KyEStZnnd9vabEpVZYmYcDSMJ-GFDCQH0bMEyOiuScLgQihpkEbVkLjr-CGxLMRRRTXZ72J2ZQq8SpgjZ03Q';
const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js', {
    scope: '/'
  })
    .then(function (swRegistration) {
      console.log('[SW Registration]: Service Worker was registered', swRegistration);
    })
    .catch(function (error) {
      console.log('[SW Registration]: There was a problem with the Service Worker registration', error);
    });
} else {
  console.log("[SW Registration]: Service workers aren't supported in this browser");
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('[SW Registration]: Showing install prompt');

  event.userChoice.then(function (choiceResult) {
    console.log(choiceResult.outcome);
  });
});

window.addEventListener('load', function () {
  document.querySelector('.js-push-subscribe-button').addEventListener('click', function () {
    pushSubscribe();
  });
  document.querySelector('.js-push-unsubscribe-button').addEventListener('click', function () {
  });
});

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


function pushSubscribe () {
  if ('showNotification' in ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(function (swRegistration) {
      swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })
        .then(function (pushSubscription) {
          console.log('[SW Registration]: Push subscription is successful')
          console.log('[SW Registration]: Sending subscription object to backend to subscribe', pushSubscription)
          return fetch('http://localhost:3000/webpush', {
            method: 'POST',
            body: JSON.stringify({action: 'subscribe', subscription: pushSubscription}),
            headers: new Headers({'Content-Type': 'application/json'})
          })
        })
        .catch(function (error) {
          if (Notification.permission === 'denied') {
            console.log('[SW Registration]: Permission for Notifications was denied')
          } else {
            console.log('[SW Registration]: Unable to subscribe to push.', error)
          }
        })
    })
  } else {
    console.log("[SW Registration]: Notifications aren't supported in this browser")
  }
}


