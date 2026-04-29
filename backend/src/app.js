const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const requestTimeout = require('./middleware/requestTimeout');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const supportRoutes = require('./routes/support.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Required for correct rate-limiting behind proxies (Render/Vercel/NGINX)
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security
app.use(helmet({
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Parse CORS_ORIGIN as comma-separated list for multi-origin support (e.g. staging + production)
const corsOrigins = CORS_ORIGIN.includes(',') ? CORS_ORIGIN.split(',').map(o => o.trim()) : CORS_ORIGIN;
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Performance + basic request logging
app.use(compression());
app.use(morgan('tiny', { skip: (req) => req.path === '/api/health' }));

// Rate Limiting
app.use(generalLimiter);

// Request timeout guard (15s to accommodate uploads and large nearby queries)
app.use(requestTimeout(15000));

// Body Parsing
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Root info route
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'Properties for Rentz API',
      health: '/api/health',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/support', supportRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
