const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Collection name
const ITEMS_COLLECTION = 'items';

// GET all items
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection(ITEMS_COLLECTION).get();
    const items = [];
    
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      count: items.length,
      items: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST create new item
router.post('/', async (req, res) => {
  try {
    const { name, description, status, category, location, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !status) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and status are required'
      });
    }

    // Validate status
    if (status !== 'Lost' && status !== 'Found') {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "Lost" or "Found"'
      });
    }

    // Create item data structure
    const itemData = {
      name: name.trim(),
      description: description.trim(),
      status: status,
      category: category || 'Other',
      location: location || null,
      imageUrl: imageUrl || null, // Now accepts image URL
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    const docRef = await db.collection(ITEMS_COLLECTION).add(itemData);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: {
        id: docRef.id,
        ...itemData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// GET single item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(ITEMS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      item: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PATCH update item status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();

    await db.collection(ITEMS_COLLECTION).doc(id).update(updates);

    const doc = await db.collection(ITEMS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Item updated successfully',
      item: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(ITEMS_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;