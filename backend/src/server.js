const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root / Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'StreamSphere OTT Platform API',
    database: process.env.DB_NAME || 'streamsphere_db',
    timestamp: new Date().toISOString()
  });
});

// Route Registrations
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/genres', require('./routes/genreRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/watch-history', require('./routes/watchHistoryRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` StreamSphere Backend API running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Database:     ${process.env.DB_NAME || 'streamsphere_db'}`);
  console.log(`=======================================================`);
});

module.exports = app;
