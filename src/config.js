(() => {
  const date = new Date();

  date.setUTCHours(12, 0, 0, 0);
  return date;
})();

const Config = {
  notificationSchedule: 'minute', // repeat in each minute
  notificationTime: new Date(Date.now() + 60 * 1000), // 1 minute after app been started

  // PROD values example
  // notificationSchedule: 'day', // repeat daily
  // notificationTime: (() => { // 12 PM UTC
  //   const date = new Date()

  //   date.setUTCHours(12, 0, 0, 0)
  //   return date
  // })(),

  firebaseApiKey: 'AIzaSyBYwdi8DnH3LNOYvyQ-PJK8xEASHB-2qNQ',
  firebaseAuthDomain: 'gooddollar-bdd19.firebaseapp.com',
  firebaseProjectId: 'gooddollar-bdd19',
  firebaseStorageBucket: 'gooddollar-bdd19.appspot.com',
  firebaseMessagingSenderId: '258416133884',
  firebaseAppId: '1:258416133884:web:166018f41dcb238aa83979',
  firebaseWebPushKeyPair:
    'BJYCEUbfnPfP-Ygq7Xm5Pwg-Ky8USDRUxLpy3drAqSPPcG4ErDx3X6YIw9CJMHvhFsfkMGz-PILgOQe5dyOiLQs',

  // GoodDApp values example
  // firebaseApiKey: env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBYwdi8DnH3LNOYvyQ-PJK8xEASHB-2qNQ",
  // firebaseAuthDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN || "gooddollar-bdd19.firebaseapp.com",
  // firebaseProjectId: env.REACT_APP_FIREBASE_PROJECT_ID || "gooddollar-bdd19",
  // firebaseStorageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gooddollar-bdd19.appspot.com",
  // firebaseMessagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "258416133884",
  // firebaseAppId: env.REACT_APP_FIREBASE_APP_ID || "1:258416133884:web:166018f41dcb238aa83979",
  // firebaseWebPushKeyPair: env.REACT_APP_FIREBASE_WEB_PUSH_KEYPAIR || 'BJYCEUbfnPfP-Ygq7Xm5Pwg-Ky8USDRUxLpy3drAqSPPcG4ErDx3X6YIw9CJMHvhFsfkMGz-PILgOQe5dyOiLQs',
};

export default Config;
