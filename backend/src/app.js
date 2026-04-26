const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const requestTimeout = require('./middleware/requestTimeout');
const errorHandler = require('./middleware/error');
const rateLimit = require('express-rate-limit');

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
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Performance + basic request logging
app.use(compression());
app.use(morgan('tiny', { skip: (req) => req.path === '/api/health' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again later.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Request timeout guard
app.use(requestTimeout(5000));

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
      service: 'Apna Stay API',
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
