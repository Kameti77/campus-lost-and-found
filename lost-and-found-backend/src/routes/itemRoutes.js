const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { sendToTopic, sendToDevice, saveNotification, getUserFCMToken } = require('../services/notificationService');

const ITEMS_COLLECTION = 'items';

// ─── STRIP PRIVATE FIELDS ─────────────────────────────────────────────────
// NEVER send privateDescription or privateImageUrl to frontend
// This runs on every GET response
const stripPrivateFields = (item) => {
  const { privateDescription, privateImageUrl, ...publicItem } = item;
  return publicItem;
};

// ─── GET ALL ITEMS ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection(ITEMS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const items = [];
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...stripPrivateFields(doc.data()),
        // Convert timestamp for frontend
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET SINGLE ITEM ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection(ITEMS_COLLECTION).doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const data = doc.data();
    res.json({
      success: true,
      item: {
        id: doc.id,
        ...stripPrivateFields(data),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── CREATE ITEM ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      // Public fields
      title, type, category, location,
      currentLocation,  // found items only
      date,
      imageUrl,         // lost: public url, found: null
      reportedBy,       // uid from Firebase Auth
      reportedByName,   // first name only

      // Private fields — stored but never returned by GET
      privateDescription,
      privateImageUrl,  // found: private image, lost: proof image
      
      // Connection field — links found item to original lost post
      relatedToLostItemId,  // NEW: if this found item is responding to a lost post
    } = req.body;

    // Validate required fields
    if (!title || !type || !reportedBy) {
      return res.status(400).json({
        success: false,
        error: 'title, type, and reportedBy are required'
      });
    }

    if (type !== 'lost' && type !== 'found') {
      return res.status(400).json({
        success: false,
        error: 'type must be "lost" or "found"'
      });
    }

    const itemData = {
      // Public
      title: title.trim(),
      type,
      category: category || 'Other',
      location: location?.trim() || null,
      currentLocation: type === 'found' ? (currentLocation?.trim() || null) : null,
      date: date ? new Date(date) : admin.firestore.FieldValue.serverTimestamp(),
      status: 'open',
      imageUrl: type === 'lost' ? (imageUrl || null) : null, // found items never have public image
      reportedBy,
      reportedByName: reportedByName || 'Anonymous',

      // Private — stored but stripped from GET responses
      privateDescription: privateDescription?.trim() || null,
      privateImageUrl: privateImageUrl || null,
      
      // Connection — links this found item to original lost post
      relatedToLostItemId: relatedToLostItemId || null,

      // Timestamps — server-side, not client clock
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(ITEMS_COLLECTION).add(itemData);

    // ── If this is a "I Found This" response, notify the original poster ──
    if (relatedToLostItemId && type === 'found') {
      try {
        const lostPostDoc = await db.collection(ITEMS_COLLECTION).doc(relatedToLostItemId).get();
        
        if (lostPostDoc.exists) {
          const lostPostData = lostPostDoc.data();
          const originalPosterId = lostPostData.reportedBy;
          
          // Don't notify if finder is the same person (edge case)
          if (originalPosterId !== reportedBy) {
            // Save in-app notification
            await saveNotification({
              toUid: originalPosterId,
              fromUid: reportedBy,
              itemId: docRef.id,
              itemTitle: title,
              type: 'potential_match_found'
            });

            // Send push notification
            const token = await getUserFCMToken(originalPosterId);
            await sendToDevice(
              token,
              '🎉 Someone Found Your Item!',
              `Someone reported finding a ${title} that might match your lost item. Check it out!`,
              { itemId: docRef.id, type: 'potential_match_found' }
            );
          }
        }
      } catch (notifyError) {
        // Log but don't fail the whole request if notification fails
        console.error('Failed to notify original poster:', notifyError);
      }
    }

    // ── Broadcast FCM push to all subscribers ──
    // Differentiate lost vs found in the notification
    const pushTitle = type === 'lost'
      ? '🔍 New Lost Item Reported'
      : '📦 New Found Item Reported';
    const pushBody = `A ${title} was just reported ${type} near ${location || 'campus'}`;

    await sendToTopic('new_items', pushTitle, pushBody, {
      itemId: docRef.id,
      type: 'new_item'
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: { id: docRef.id, ...stripPrivateFields(itemData) }
    });

  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── UPDATE ITEM ──────────────────────────────────────────────────────────
// When location is updated + pending clarification exists → auto-resolve
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Always update the timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Get current item to check if location actually changed
    const currentDoc = await db.collection(ITEMS_COLLECTION).doc(id).get();
    if (!currentDoc.exists) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const currentData = currentDoc.data();
    const locationChanged = updates.location && updates.location !== currentData.location;
    const currentLocationChanged = updates.currentLocation &&
      updates.currentLocation !== currentData.currentLocation;

    // Update the item in Firestore
    await db.collection(ITEMS_COLLECTION).doc(id).update(updates);

    // ── Auto-resolve clarification requests if location was updated ──
    // This triggers the notification back to the owner automatically
    if (locationChanged || currentLocationChanged) {
      const pendingRequests = await db.collection('clarificationRequests')
        .where('itemId', '==', id)
        .where('status', '==', 'pending')
        .get();

      if (!pendingRequests.empty) {
        const batch = db.batch();

        for (const requestDoc of pendingRequests.docs) {
          const request = requestDoc.data();

          // Mark request as resolved
          batch.update(requestDoc.ref, {
            status: 'resolved',
            resolvedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Save in-app notification for the requester (owner)
          await saveNotification({
            toUid: request.requesterUid,
            fromUid: request.finderUid,
            itemId: id,
            itemTitle: request.itemTitle,
            type: 'location_clarification_resolved'
          });

          // Send push notification to owner
          const requesterToken = await getUserFCMToken(request.requesterUid);
          await sendToDevice(
            requesterToken,
            '✅ Location Updated!',
            `The finder has updated the location for the found ${request.itemTitle} — check the post`,
            { itemId: id, type: 'location_clarification_resolved' }
          );
        }

        await batch.commit();
      }
    }

    // Return updated item without private fields
    const updatedDoc = await db.collection(ITEMS_COLLECTION).doc(id).get();
    const updatedData = updatedDoc.data();

    res.json({
      success: true,
      message: 'Item updated successfully',
      item: {
        id: updatedDoc.id,
        ...stripPrivateFields(updatedData),
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString(),
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString(),
      }
    });

  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── DELETE ITEM ──────────────────────────────────────────────────────────
// Deletes item + both storage images + all related clarification requests
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get item first to access image URLs
    const doc = await db.collection(ITEMS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const itemData = doc.data();

    // ── Delete images from Firebase Storage ──
    const { bucket } = require('../config/firebase');
    const deleteImage = async (imageUrl) => {
      if (!imageUrl) return;
      try {
        // Extract filename from URL
        const urlParts = imageUrl.split('/');
        const filename = decodeURIComponent(urlParts[urlParts.length - 1].split('?')[0]);
        await bucket.file(filename).delete();
      } catch (err) {
        // File might already be deleted — log but don't crash
        console.warn('Image delete warning:', err.message);
      }
    };

    await deleteImage(itemData.imageUrl);
    await deleteImage(itemData.privateImageUrl);

    // ── Delete all clarification requests for this item ──
    const requests = await db.collection('clarificationRequests')
      .where('itemId', '==', id)
      .get();

    const batch = db.batch();
    requests.forEach(doc => batch.delete(doc.ref));

    // ── Delete related notifications for this item ──
    const notifications = await db.collection('notifications')
      .where('itemId', '==', id)
      .get();
    notifications.forEach(doc => batch.delete(doc.ref));

    // ── Delete the item itself ──
    batch.delete(db.collection(ITEMS_COLLECTION).doc(id));

    await batch.commit();

    res.json({ success: true, message: 'Item and all related data deleted successfully' });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;