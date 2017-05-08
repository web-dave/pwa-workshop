var restroot = 'http://localhost:3000/';

if ('serviceWorker' in navigator) {
  if((location.host.indexOf('localhost')===-1)&&(location.host.indexOf('127.0.0.1')===-1)){
    restroot = 'https://hidden-shelf-50024.herokuapp.com/';
  }
  navigator.serviceWorker.register('/service-worker.js', {
    scope: '/'
  })
    .then(function (swRegistration) {
      console.log('[SW Registration]: Service Worker was registered', swRegistration)
    })
    .catch(function (error) {
      console.log('[SW Registration]: There was a problem with the Service Worker registration', error)
    })
} else {
  console.log("[SW Registration]: Service workers aren't supported in this browser")
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('[SW Registration]: Showing install prompt')

  event.userChoice.then(function (choiceResult) {
    console.log(choiceResult.outcome)
  })
})

window.addEventListener('load', function () {
  document.querySelector('.js-push-subscribe-button').addEventListener('click', function () {
    pushSubscribe()
  })
  document.querySelector('.js-push-unsubscribe-button').addEventListener('click', function () {
    pushUnsubscribe()
  })
  document.querySelector('.js-sync-button').addEventListener('click', function () {
    registerSync()
  })
})

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
const vapidPublicKey = 'BK0KyEStZnnd9vabEpVZYmYcDSMJ-GFDCQH0bMEyOiuScLgQihpkEbVkLjr-CGxLMRRRTXZ72J2ZQq8SpgjZ03Q'
const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)


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
          return fetch(restroot +'webpush', {
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

function pushUnsubscribe () {
  navigator.serviceWorker.ready.then(function (swRegistration) {
    swRegistration.pushManager.getSubscription().then(
      function (pushSubscription) {
        if (!pushSubscription) {
          console.log('[SW Registration]: No push subscription found')
          return
        }

        console.log('[SW Registration]: Sending subscription object to backend to unsubscribe', pushSubscription)
        return fetch(restroot +'webpush', {
          method: 'POST',
          body: JSON.stringify({action: 'unsubscribe', subscription: pushSubscription}),
          headers: new Headers({'Content-Type': 'application/json'})
        })

        pushSubscription.unsubscribe().then(function () {
          console.log('[SW Registration]: Push unsubscription is successful')
        }).catch(function (error) {
          console.log('[SW Registration]: Unable to unsubscribe from push.', error)
        })
      }).catch(function (error) {
      console.log('[SW Registration]: Unable to get push subscription', error)
    })
  })
}

function registerSync () {
  if ('SyncManager' in window) {
    var messageForm = document.querySelector('.js-sync-form')
    var messageField = messageForm.querySelector('.js-sync-input')

    messageForm.addEventListener('submit', function (event) {
      console.log('[SW Registration]: Form submit detected')

      var message = {
        message: messageField.value
      }

      idbKeyval.set('tweet-message', message)
        .then(function () {
          console.log('[SW Registration]: Wrote data to IndexedDB', message)

          navigator.serviceWorker.ready.then(function (swRegistration) {
            swRegistration.sync.register('post-tweet')
              .then(function () {
                console.log('[SW Registration]: Background sync registered')
              })
              .catch(function (error) {
                // system was unable to register for a sync,
                // this could be an OS-level restriction
                console.log('[SW Registration]: Error registering Background sync', error)
              })
          })
        })
    })

    console.log('[SW Registration]: Background sync initiated')
  } else {
    console.log("[SW Registration]: Background sync isn't supported in this browser")
  }
}
