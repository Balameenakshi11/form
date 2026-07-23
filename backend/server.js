// ============================================================
//  server.js
//  Main entry point. Wires up middleware, static file serving,
//  routes, and error handling, then starts the HTTP server.
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
require('./config/database'); // establishes the pool + logs connection status

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists on startup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------------------------------
//  Core middleware
// ------------------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // parse application/json bodies
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded bodies

// Serve uploaded photos/aadhaar files statically at /uploads/<filename>
app.use('/uploads', express.static(uploadDir));

// Root route welcome/status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Yaazhlan Dance Studio API is running.',
    health: '/api/health'
  });
});

// ------------------------------------------------------------
//  Routes
// ------------------------------------------------------------
app.use('/api', studentRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Yaazhlan Dance Studio API is running.' });
});

// ------------------------------------------------------------
//  404 handler
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ------------------------------------------------------------
//  Central error handler (also catches multer errors)
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  if (err.message && err.message.includes('Only .jpg')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 5MB.' });
  }

  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ------------------------------------------------------------
//  Start server
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Yaazhlan Dance Studio backend running at http://localhost:${PORT}`);
});
