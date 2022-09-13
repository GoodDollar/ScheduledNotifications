/* eslint-disable no-undef, no-restricted-globals */
// Scripts for firebase and firebase messaging
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
);

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: 'AIzaSyBYwdi8DnH3LNOYvyQ-PJK8xEASHB-2qNQ',
  authDomain: 'gooddollar-bdd19.firebaseapp.com',
  projectId: 'gooddollar-bdd19',
  storageBucket: 'gooddollar-bdd19.appspot.com',
  messagingSenderId: '258416133884',
  appId: '1:258416133884:web:166018f41dcb238aa83979',
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

if (messaging.isSupported()) {
  messaging.onBackgroundMessage(async payload => {
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
