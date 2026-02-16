const { admin, db } = require('../config/firebase');

// ─── SEND TO SINGLE DEVICE (targeted) ─────────────────────────────────────
// Used for: clarification request → finder, location updated → owner
const sendToDevice = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.warn('sendToDevice: no FCM token provided, skipping push');
    return null;
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      // data payload is key-value strings — used to navigate on tap
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      webpush: {
        notification: { title, body, icon: '/icon.png' },
        fcmOptions: { link: data.itemId ? `/?item=${data.itemId}` : '/' }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push sent to device:', response);
    return response;
  } catch (error) {
    // Token might be stale — log but don't crash
    console.error('sendToDevice error:', error.message);
    return null;
  }
};

// ─── SEND TO TOPIC (broadcast to all subscribers) ─────────────────────────
// Used for: new item posted → all users
const sendToTopic = async (topic, title, body, data = {}) => {
  try {
    const message = {
      topic,
      notification: { title, body },
      data: { ...data },
      webpush: {
        notification: { title, body, icon: '/icon.png' },
        fcmOptions: { link: data.itemId ? `/?item=${data.itemId}` : '/' }
      }
    };

    const response = await admin.messaging().send(message);
    console.log(`Push sent to topic [${topic}]:`, response);
    return response;
  } catch (error) {
    console.error('sendToTopic error:', error.message);
    return null;
  }
};

// ─── SAVE IN-APP NOTIFICATION TO FIRESTORE ────────────────────────────────
// Every push also gets saved to Firestore for the bell icon
const saveNotification = async ({ toUid, fromUid = null, itemId, itemTitle, type }) => {
  try {
    const notifData = {
      toUid,
      fromUid,
      itemId,
      itemTitle,
      type,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db.collection('notifications').add(notifData);
    return ref.id;
  } catch (error) {
    console.error('saveNotification error:', error.message);
    return null;
  }
};

// ─── GET USER FCM TOKEN FROM FIRESTORE ────────────────────────────────────
const getUserFCMToken = async (uid) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    return userDoc.exists ? userDoc.data().fcmToken || null : null;
  } catch (error) {
    console.error('getUserFCMToken error:', error.message);
    return null;
  }
};

module.exports = {
  sendToDevice,
  sendToTopic,
  saveNotification,
  getUserFCMToken
};