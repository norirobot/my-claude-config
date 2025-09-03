const { logger } = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Create API error instances
 */
const createApiError = {
  badRequest: (message = 'Bad Request') => new ApiError(400, message),
  unauthorized: (message = 'Unauthorized') => new ApiError(401, message),
  forbidden: (message = 'Forbidden') => new ApiError(403, message),
  notFound: (message = 'Not Found') => new ApiError(404, message),
  conflict: (message = 'Conflict') => new ApiError(409, message),
  unprocessableEntity: (message = 'Unprocessable Entity') => new ApiError(422, message),
  tooManyRequests: (message = 'Too Many Requests') => new ApiError(429, message),
  internalServerError: (message = 'Internal Server Error') => new ApiError(500, message),
  notImplemented: (message = 'Not Implemented') => new ApiError(501, message),
  serviceUnavailable: (message = 'Service Unavailable') => new ApiError(503, message),
};

/**
 * Convert error to API error format
 * @param {Error} err - Original error
 * @returns {ApiError} Formatted API error
 */
function convertToApiError(err) {
  let error = err;

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        error = createApiError.conflict('Resource already exists');
        break;
      case '23503': // foreign_key_violation
        error = createApiError.badRequest('Referenced resource does not exist');
        break;
      case '23502': // not_null_violation
        error = createApiError.badRequest('Required field is missing');
        break;
      case '42P01': // undefined_table
        error = createApiError.internalServerError('Database table not found');
        break;
      default:
        error = createApiError.internalServerError('Database error occurred');
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createApiError.unauthorized('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = createApiError.unauthorized('Token expired');
  }

  // Validation errors (Joi)
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = createApiError.badRequest(`Validation error: ${message}`);
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = createApiError.badRequest('File size too large');
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = createApiError.badRequest('Unexpected file field');
  }

  // Cast to ApiError if not already
  if (!(error instanceof ApiError)) {
    error = new ApiError(500, err.message || 'Something went wrong', false, err.stack);
  }

  return error;
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Convert error to ApiError format
  const error = convertToApiError(err);

  // Log error details
  const logData = {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous',
    },
  };

  // Log based on error severity
  if (error.statusCode >= 500) {
    logger.error('Server Error', logData);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error', logData);
  }

  // Prepare error response
  const errorResponse = {
    error: {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
    
    // Add original error for debugging
    if (err !== error) {
      errorResponse.originalError = {
        message: err.message,
        name: err.name,
        code: err.code,
      };
    }
  }

  // Add request ID if available
  if (req.requestId) {
    errorResponse.error.requestId = req.requestId;
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
}

/**
 * Handle async route errors
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = createApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
}

/**
 * Validation error handler for express-validator
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
function validationErrorHandler(req, res, next) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));
    
    const error = createApiError.badRequest('Validation failed');
    error.details = errorMessages;
    
    return next(error);
  }
  
  next();
}

module.exports = {
  ApiError,
  createApiError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationErrorHandler,
};