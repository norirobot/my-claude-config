const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
// Use SQLite for development
const { connectDatabase } = require('./config/database-sqlite');
// const { connectRedis } = require('./config/redis'); // Optional for development
const socketService = require('./services/socketService');

// Import Routes
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversation');
const userRoutes = require('./routes/users');
const situationRoutes = require('./routes/situations');
const sessionRoutes = require('./routes/sessions');
const tutorRoutes = require('./routes/tutors');
const pointRoutes = require('./routes/points');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-domain.com'] 
    : ['http://localhost:19006', 'http://localhost:3000'],
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Basic Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for web app
app.use(express.static('../web-app'));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'English Learning API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/situations', situationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/points', pointRoutes);

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to English Learning & Tutor Connection API!',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`
  });
});

// Global Error Handler
app.use(errorHandler);

// Initialize Database and Redis connections
async function startServer() {
  try {
    // Connect to Database
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Redis is optional for development
    // await connectRedis();
    // logger.info('✅ Redis connected successfully');

    // Start Server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 English Learning API Server is running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API Base URL: http://localhost:${PORT}`);
    });

    // Initialize Socket.io
    socketService.initialize(server);
    logger.info('🔌 Socket.io real-time communication initialized');

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      logger.info('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;