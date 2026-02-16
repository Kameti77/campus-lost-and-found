const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const {
  sendToDevice,
  saveNotification,
  getUserFCMToken
} = require('../services/notificationService');

// ─── REQUEST LOCATION CLARIFICATION ───────────────────────────────────────
// Called when owner clicks "Request Location Clarification" on a found item
// POST /notifications/request-clarification
router.post('/request-clarification', async (req, res) => {
  try {
    const { itemId, itemTitle, finderUid, requesterUid } = req.body;

    if (!itemId || !finderUid || !requesterUid || !itemTitle) {
      return res.status(400).json({
        success: false,
        error: 'itemId, itemTitle, finderUid, and requesterUid are required'
      });
    }

    // Prevent duplicate requests — check if one already exists
    const existing = await db.collection('clarificationRequests')
      .where('itemId', '==', itemId)
      .where('requesterUid', '==', requesterUid)
      .where('status', '==', 'pending')
      .get();

    if (!existing.empty) {
      return res.status(409).json({
        success: false,
        error: 'You already have a pending clarification request for this item'
      });
    }

    // Save clarification request to Firestore
    // This is what gets checked when the finder edits their post location
    const requestRef = await db.collection('clarificationRequests').add({
      itemId,
      itemTitle,
      requesterUid,
      finderUid,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Save in-app notification for finder's bell
    await saveNotification({
      toUid: finderUid,
      fromUid: requesterUid,
      itemId,
      itemTitle,
      type: 'location_clarification_request'
    });

    // Send push notification to finder's device
    const finderToken = await getUserFCMToken(finderUid);
    await sendToDevice(
      finderToken,
      '📍 Location Clarification Needed',
      `Someone needs more details about the location of your found ${itemTitle}`,
      { itemId, type: 'location_clarification_request' }
    );

    res.status(201).json({
      success: true,
      message: 'Clarification request sent',
      requestId: requestRef.id
    });

  } catch (error) {
    console.error('request-clarification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET USER NOTIFICATIONS ────────────────────────────────────────────────
// Called by NotificationBell to populate dropdown
// GET /notifications/:uid
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const snapshot = await db.collection('notifications')
      .where('toUid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(20) // last 20 notifications
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to ISO string for frontend
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    // Count unread separately for badge
    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ success: true, notifications, unreadCount });

  } catch (error) {
    console.error('get notifications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── MARK NOTIFICATION AS READ ────────────────────────────────────────────
// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('notifications').doc(id).update({ read: true });

    res.json({ success: true, message: 'Notification marked as read' });

  } catch (error) {
    console.error('mark-read error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────
// PATCH /notifications/read-all/:uid
router.patch('/read-all/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const snapshot = await db.collection('notifications')
      .where('toUid', '==', uid)
      .where('read', '==', false)
      .get();

    // Batch update — more efficient than individual updates
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    res.json({ success: true, message: 'All notifications marked as read' });

  } catch (error) {
    console.error('read-all error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

// ─── SUBSCRIBE DEVICE TO TOPIC ────────────────────────────────────────────
// Called by useFCM hook after getting FCM token
// POST /notifications/subscribe-topic
router.post('/subscribe-topic', async (req, res) => {
  try {
    const { token, topic } = req.body;
    if (!token || !topic) {
      return res.status(400).json({ success: false, error: 'token and topic required' });
    }
    const { admin } = require('../config/firebase');
    await admin.messaging().subscribeToTopic([token], topic);
    res.json({ success: true, message: `Subscribed to ${topic}` });
  } catch (error) {
    console.error('subscribe-topic error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});