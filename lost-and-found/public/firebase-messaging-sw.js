// firebase-messaging-sw.js
// IMPORTANT: This file MUST live in the /public folder
// The browser registers it automatically from that location
// It handles push notifications when the app is closed or in background

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Must match your firebaseConfig in firebase.js exactly
firebase.initializeApp({
  apiKey: "AIzaSyAl1xwUoTHT2RvNcLgIOKRhMwUxnn7oP-M",
  authDomain: "lostandfound-937c4.firebaseapp.com",
  projectId: "lostandfound-937c4",
  storageBucket: "lostandfound-937c4.firebasestorage.app",
  messagingSenderId: "229158569301",
  appId: "1:229158569301:web:59686ed79da84e139f1bdc"
});

const messaging = firebase.messaging();

// Handle background messages
// This fires when app is closed or browser tab is not focused
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body } = payload.notification;
  const { itemId } = payload.data || {};

  // Show the notification
  self.registration.showNotification(title, {
    body,
    icon: '/icon.png',        // add your app icon to public/
    badge: '/badge.png',      // small icon shown in notification bar
    tag: itemId || 'default', // prevents duplicate notifications for same item
    data: { itemId },
    actions: [
      { action: 'view', title: 'View Item' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

// Handle notification click — opens the app to the right item
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const itemId = event.notification.data?.itemId;
  const urlToOpen = itemId
    ? `${self.location.origin}/?item=${itemId}`
    : self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});