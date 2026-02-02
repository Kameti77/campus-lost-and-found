const express = require('express');
const router = express.Router();
const { db, bucket } = require('../config/firebase');

// Test Firestore connection
router.get('/firestore', async (req, res) => {
  try {
    // Try to write a test document
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      message: 'Firebase connected!',
      timestamp: new Date().toISOString()
    });

    // Try to read it back
    const doc = await testRef.get();
    
    res.json({
      success: true,
      message: 'Firestore is working!',
      data: doc.data()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Storage connection
router.get('/storage', async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ maxResults: 1 });
    
    res.json({
      success: true,
      message: 'Storage is working!',
      bucketName: bucket.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;