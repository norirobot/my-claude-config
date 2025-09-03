const winston = require('winston');
const path = require('path');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format (for development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Create transports array
const transports = [
  // Console transport (always enabled)
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat,
  }),
];

// Add file transports in production or when LOG_FILE is specified
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE) {
  // Ensure logs directory exists
  const fs = require('fs');
  const logsDir = path.dirname(process.env.LOG_FILE || './logs/app.log');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE || './logs/app.log',
      level: 'info',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: process.env.ERROR_LOG_FILE || './logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Handle uncaught exceptions and rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: './logs/exceptions.log',
      format: logFormat,
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: './logs/rejections.log',
      format: logFormat,
    })
  );
}

/**
 * Create child logger with additional metadata
 * @param {object} meta - Additional metadata
 * @returns {winston.Logger} Child logger
 */
function createChildLogger(meta) {
  return logger.child(meta);
}

/**
 * Log API request details
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
function logApiRequest(req, res, duration) {
  const { method, url, ip, get } = req;
  const { statusCode } = res;
  
  const logData = {
    method,
    url,
    ip,
    userAgent: get('User-Agent'),
    statusCode,
    duration: `${duration}ms`,
  };

  if (statusCode >= 400) {
    logger.error('API Request Error', logData);
  } else {
    logger.http('API Request', logData);
  }
}

/**
 * Log database query performance
 * @param {string} query - SQL query
 * @param {number} duration - Query duration in ms
 * @param {number} rowCount - Number of rows affected
 */
function logDatabaseQuery(query, duration, rowCount = 0) {
  if (process.env.NODE_ENV === 'development' && duration > 1000) {
    logger.warn('Slow Database Query', {
      query: query.substring(0, 100) + '...',
      duration: `${duration}ms`,
      rowCount,
    });
  } else if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Database Query', {
      query: query.substring(0, 100) + '...',
      duration: `${duration}ms`,
      rowCount,
    });
  }
}

/**
 * Log authentication events
 * @param {string} event - Event type (login, logout, register, etc.)
 * @param {string} userId - User ID
 * @param {string} ip - IP address
 * @param {boolean} success - Whether the event was successful
 * @param {string} reason - Additional reason/error message
 */
function logAuthEvent(event, userId, ip, success, reason = null) {
  const logData = {
    event,
    userId,
    ip,
    success,
    timestamp: new Date().toISOString(),
  };

  if (reason) {
    logData.reason = reason;
  }

  if (success) {
    logger.info(`Auth Success: ${event}`, logData);
  } else {
    logger.warn(`Auth Failed: ${event}`, logData);
  }
}

/**
 * Log AI service interactions
 * @param {string} service - Service name (openai, speech-recognition, etc.)
 * @param {string} operation - Operation type
 * @param {number} duration - Operation duration in ms
 * @param {boolean} success - Whether the operation was successful
 * @param {object} metadata - Additional metadata
 */
function logAIServiceCall(service, operation, duration, success, metadata = {}) {
  const logData = {
    service,
    operation,
    duration: `${duration}ms`,
    success,
    ...metadata,
  };

  if (success) {
    logger.info(`AI Service Call: ${service}/${operation}`, logData);
  } else {
    logger.error(`AI Service Error: ${service}/${operation}`, logData);
  }
}

module.exports = {
  logger,
  createChildLogger,
  logApiRequest,
  logDatabaseQuery,
  logAuthEvent,
  logAIServiceCall,
};