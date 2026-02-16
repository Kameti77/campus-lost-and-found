const express = require('express');
const router = express.Router();
const multer = require('multer');
const { bucket } = require('../config/firebase');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload single image
// Accepts optional `isPrivate` in request body or query
// isPrivate=true  → items/private/ → NOT made public (found item images, proof images)
// isPrivate=false → items/public/  → made public   (lost item images)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // isPrivate comes as string from FormData — convert to boolean
    const isPrivate = req.body.isPrivate === 'true' || req.query.isPrivate === 'true';

    const timestamp = Date.now();
    const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Route to different folders based on privacy
    const folder = isPrivate ? 'items/private' : 'items/public';
    const filename = `${folder}/${timestamp}_${sanitizedName}`;

    const file = bucket.file(filename);

    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    stream.on('error', (error) => {
      console.error('Upload stream error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload file' });
    });

    stream.on('finish', async () => {
      let publicUrl;

      if (isPrivate) {
        // Private files are NOT made public
        // URL is stored in DB but never sent to frontend via GET /items
        publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        // Note: this URL won't be accessible without auth — that's intentional
      } else {
        // Public files are made publicly accessible
        await file.makePublic();
        publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        imageUrl: publicUrl,
        filename,
        isPrivate
      });
    });

    stream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;