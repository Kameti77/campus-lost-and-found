import { useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessagingInstance, db } from '../config/firebase';

// Your VAPID key from Firebase Console
// Go to: Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = 'BLHmPNrWymCUMV01tsCoHJDX7m5vgluB8N9bGkZKtZ_gVBRQU-BMXz845jfPMBz2vDRgKJ-5ZVLDIcnNXo9PJww';

// useFCM handles everything Firebase Cloud Messaging needs on the frontend:
// 1. Gets the FCM token for this device
// 2. Saves it to Firestore so backend can send targeted pushes
// 3. Subscribes to 'new_items' topic for broadcasts
// 4. Handles foreground messages (when app IS open)
//
// Call this hook once after the user logs in — inside AuthContext or App

const useFCM = (currentUser, onForegroundMessage) => {
  const messagingRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const initFCM = async () => {
      try {
        // Get messaging instance (returns null if browser doesn't support it)
        const messaging = await getMessagingInstance();
        if (!messaging) {
          console.log('FCM not supported in this browser');
          return;
        }

        messagingRef.current = messaging;

        // Check current permission — don't re-request if already granted/denied
        if (Notification.permission === 'denied') {
          console.log('Notifications blocked by user');
          return;
        }

        if (Notification.permission !== 'granted') {
          // Permission not yet granted — wait for user to click
          // "Enable Notifications" in our custom modal (NotificationPermissionModal)
          // The modal calls requestAndSaveToken() when user clicks enable
          return;
        }

        // Permission already granted from before — get token silently
        await requestAndSaveToken(messaging, currentUser.uid);

      } catch (error) {
        console.error('FCM init error:', error);
      }
    };

    initFCM();
  }, [currentUser]);

  // Called by NotificationPermissionModal when user clicks "Enable Notifications"
  // Also called on subsequent logins if permission was already granted
  const requestAndSaveToken = async (messaging, uid) => {
    try {
      const resolvedMessaging = messaging || messagingRef.current;
      if (!resolvedMessaging) return false;

      // This triggers the browser's native permission dialog if not yet granted
      const token = await getToken(resolvedMessaging, { vapidKey: VAPID_KEY });

      if (!token) {
        console.warn('No FCM token received');
        return false;
      }

      // Save token to Firestore — backend reads this to send targeted pushes
      await updateDoc(doc(db, 'users', uid), { fcmToken: token });

      // Subscribe to new_items topic via your backend
      // We call the backend because topic subscription requires Admin SDK
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, topic: 'new_items' })
      });

      console.log('FCM setup complete');
      return true;

    } catch (error) {
      console.error('requestAndSaveToken error:', error);
      return false;
    }
  };

  // Call this from NotificationPermissionModal
  const enableNotifications = async () => {
    if (!currentUser) return false;

    const messaging = await getMessagingInstance();
    if (!messaging) return false;

    // Register service worker first
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    return await requestAndSaveToken(messaging, currentUser.uid);
  };

  // Listen for foreground messages (when app IS open)
  // Shows a custom in-app toast instead of browser notification
  useEffect(() => {
    if (!messagingRef.current || !currentUser) return;

    const unsubscribe = onMessage(messagingRef.current, (payload) => {
      console.log('Foreground message:', payload);
      // Pass to parent component to show toast notification
      if (onForegroundMessage) {
        onForegroundMessage(payload);
      }
    });

    return unsubscribe;
  }, [currentUser, onForegroundMessage]);

  return { enableNotifications };
};

export default useFCM;