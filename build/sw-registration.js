
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
  console.log('[SW Registration]: Showing install prompt')

  event.userChoice.then(function (choiceResult) {
    console.log(choiceResult.outcome)
  });
});
