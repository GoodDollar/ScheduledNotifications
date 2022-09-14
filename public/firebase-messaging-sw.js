/* eslint-disable no-undef, no-restricted-globals */
// Scripts for firebase and firebase messaging
importScripts(
  'https://www.gstatic.com/firebasejs/9.9.4/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.9.4/firebase-messaging-compat.js',
);

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: 'AIzaSyBYwdi8DnH3LNOYvyQ-PJK8xEASHB-2qNQ',
  authDomain: 'gooddollar-bdd19.firebaseapp.com',
  projectId: 'gooddollar-bdd19',
  storageBucket: 'gooddollar-bdd19.appspot.com',
  messagingSenderId: '258416133884',
  appId: '1:258416133884:web:166018f41dcb238aa83979',
};

var clientOpts = {
  type: 'window',
  includeUncontrolled: true,
};

firebase.initializeApp(firebaseConfig);

var lastData = {};
var Messaging = firebase.messaging;

if (Messaging.isSupported()) {
  // Retrieve firebase messaging
  var messaging = Messaging();
  var channel = new BroadcastChannel('org.gooddollar.notifications');

  function activateClient(clientList) {
    var activeWindow = clientList[0];

    return activeWindow ? activeWindow.focus() : clients.openWindow('/');
  }

  messaging.onBackgroundMessage(function (payload) {
    var notification = payload.notification;

    channel.postMessage({
      event: 'received',
      data: payload,
    });

    lastData = payload.data;
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.image,
      data: payload.data,
    });
  });

  self.addEventListener('notificationclick', function (event) {
    var notification = event.notification;

    var payload = {
      data: notification.data || lastData,
      notification: {
        title: notification.title,
        body: notification.body,
        image: notification.icon,
      },
    };

    notification.close();
    lastData = {};

    event.waitUntil(
      clients
        .matchAll(clientOpts)
        .then(activateClient)
        .then(function () {
          channel.postMessage({
            event: 'opened',
            data: payload,
          });
        }),
    );
  });

  //TODO: https://stackoverflow.com/questions/49954977/service-worker-wait-for-clients-openwindow-to-complete-before-postmessage
}
