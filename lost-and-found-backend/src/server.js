const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "https://lost-and-found.onrender.com"
}))
app.use(express.json());

const path = require("path");

// Serve frontend build
// app.use(express.static(path.join(__dirname, "lost-and-found/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "lost-and-found/build", "index.html"));
// });

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
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/items', itemRoutes);
app.use('/api/test-firebase', testFirebaseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});