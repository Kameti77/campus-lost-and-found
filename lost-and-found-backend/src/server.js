const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const itemRoutes = require('./routes/itemRoutes');
const testFirebaseRoutes = require('./routes/testFirebase');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/items', itemRoutes);
app.use('/api/test-firebase', testFirebaseRoutes);
app.use('/api/upload', uploadRoutes);



// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});