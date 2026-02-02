const express = require('express');
const router = express.Router();
const multer = require('multer');
const { bucket } = require('../config/firebase');

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload single image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `items/${timestamp}_${req.file.originalname}`;

    // Create file in bucket
    const file = bucket.file(filename);

    // Create write stream
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Handle upload errors
    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file'
      });
    });

    // Handle upload success
    stream.on('finish', async () => {
      // Make file public
      await file.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      res.json({
        success: true,
        message: 'File uploaded successfully',
        imageUrl: publicUrl,
        filename: filename
      });
    });

    // Write file to stream
    stream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;