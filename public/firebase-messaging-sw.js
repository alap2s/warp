importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const searchParams = new URL(location).searchParams;

const firebaseConfig = {
  apiKey: searchParams.get('apiKey'),
  authDomain: searchParams.get('authDomain'),
  projectId: searchParams.get('projectId'),
  storageBucket: searchParams.get('storageBucket'),
  messagingSenderId: searchParams.get('messagingSenderId'),
  appId: searchParams.get('appId'),
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 