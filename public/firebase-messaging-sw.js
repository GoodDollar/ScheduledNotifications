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

firebase.initializeApp(firebaseConfig);

var Messaging = firebase.messaging;

if (Messaging.isSupported()) {
  // Retrieve firebase messaging
  var messaging = Messaging();

  messaging.onBackgroundMessage(function (payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
    };

    // TODO: custom fields

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // TODO: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event
}
