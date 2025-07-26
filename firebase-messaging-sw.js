importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');
firebase.initializeApp({
  apiKey: "YOUR_APIKEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APPID"
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload=>{
  self.registration.showNotification(payload.notification.title,{
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192.png'
  });
});
