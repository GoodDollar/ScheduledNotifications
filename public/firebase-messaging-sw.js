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
var initialData = null;
var Messaging = firebase.messaging;

if (Messaging.isSupported()) {
  // Retrieve firebase messaging
  var messaging = Messaging();
  var channel = new BroadcastChannel('org.gooddollar.notifications');

  function respond(eventName, payload) {
    channel.postMessage({
      event: eventName,
      data: payload,
    });
  }

  channel.addEventListener('message', event => {
    if (event.data !== 'getInitialNotification') {
      return;
    }

    respond('initialData', initialData);

    if (initialData) {
      respond('received', initialData);
      respond('opened', initialData);
      initialData = null;
    }
  });

  messaging.onBackgroundMessage(function (payload) {
    var notification = payload.notification;

    respond('received', payload);
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

    function activateAndNotifyClient(clientList) {
      var activeWindow = clientList[0];

      if (!activeWindow) {
        initialData = payload;
        return clients.openWindow('/');
      }

      return activeWindow.focus().then(() => {
        respond('opened', payload);
      });
    }

    notification.close();
    lastData = {};

    event.waitUntil(clients.matchAll(clientOpts).then(activateAndNotifyClient));
  });

  //TODO: https://stackoverflow.com/questions/49954977/service-worker-wait-for-clients-openwindow-to-complete-before-postmessage
}
