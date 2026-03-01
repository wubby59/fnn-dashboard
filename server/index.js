const express = require('express');
const path = require('path');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FNN_API_KEY || '';

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// API key auth middleware for agent and admin routes
function requireApiKey(req, res, next) {
  // Skip auth if no key is configured (development mode)
  if (!API_KEY) return next();
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// API routes - more specific mounts first
app.use('/api/agent', requireApiKey, require('./routes/agent'));
app.use('/api/admin', requireApiKey, require('./routes/admin'));
app.use('/api', require('./routes/api'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Initialize database on startup
try {
  getDb();
} catch (err) {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FNN Dashboard running on http://0.0.0.0:${PORT}`);
  if (!API_KEY) {
    console.log('WARNING: No FNN_API_KEY set. Agent/admin endpoints are unprotected.');
    console.log('Set FNN_API_KEY environment variable for production use.');
  }
});
