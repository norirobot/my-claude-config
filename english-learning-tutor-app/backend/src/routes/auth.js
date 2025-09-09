const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Using SQLite with User model
const User = require('../models/User');
// const { cache } = require('../config/redis'); // Optional for development
const { asyncHandler, createApiError, validationErrorHandler } = require('../middleware/errorHandler');
const { logger, logAuthEvent } = require('../utils/logger');

const router = express.Router();

// Validation schemas
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric with _ or -'),
  body('displayName')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Display name must be 2-50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Generate JWT tokens
 */
function generateTokens(userId, email) {
  const accessToken = jwt.sign(
    { userId, email, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, validationErrorHandler, asyncHandler(async (req, res) => {
  const { email, password, username, displayName, city = 'Daegu' } = req.body;
  const userIp = req.ip;

  // Check if user already exists
  const existingUser = await query(
    'SELECT user_id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    logAuthEvent('register', null, userIp, false, 'User already exists');
    throw createApiError.conflict('User with this email or username already exists');
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user in transaction
  const result = await transaction(async (client) => {
    // Create user
    const userResult = await client.query(`
      INSERT INTO users (
        user_id, email, password_hash, username, display_name, city,
        user_type, account_status, subscription_tier, language_level
      ) VALUES ($1, $2, $3, $4, $5, $6, 'learner', 'active', 'free', 'beginner')
      RETURNING user_id, email, username, display_name, city, user_type, 
                subscription_tier, language_level, created_at
    `, [uuidv4(), email, hashedPassword, username, displayName, city]);

    const user = userResult.rows[0];

    // Create user profile
    await client.query(`
      INSERT INTO user_profiles (
        user_id, learning_goals, motivation_description, target_fluency_level,
        available_time_slots, preferred_session_duration
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      user.user_id,
      ['daily_conversation'], // default learning goals
      'I want to improve my English conversation skills',
      'conversational',
      { weekdays: ['evening'], weekends: ['morning', 'afternoon'] }, // default availability
      30 // 30 minutes default session
    ]);

    // Initialize user points
    await client.query(`
      INSERT INTO user_points (user_id, total_points, available_points)
      VALUES ($1, 100, 100)
    `, [user.user_id]);

    // Log welcome points transaction
    await client.query(`
      INSERT INTO point_transactions (
        user_id, transaction_type, points_amount, source_type,
        description, balance_after
      ) VALUES ($1, 'bonus', 100, 'admin_adjustment', 'Welcome bonus', 100)
    `, [user.user_id]);

    return user;
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(result.user_id, result.email);

  // Cache refresh token
  await cache.set(`refresh_token:${result.user_id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

  // Log successful registration
  logAuthEvent('register', result.user_id, userIp, true);

  logger.info(`New user registered: ${result.email}`, {
    userId: result.user_id,
    username: result.username,
    city: result.city,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: result.user_id,
        email: result.email,
        username: result.username,
        displayName: result.display_name,
        city: result.city,
        userType: result.user_type,
        subscriptionTier: result.subscription_tier,
        languageLevel: result.language_level,
        createdAt: result.created_at,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, validationErrorHandler, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userIp = req.ip;

  // Get user with password
  const userWithPassword = await User.findByEmailWithPassword(email);
  
  if (!userWithPassword || !userWithPassword.is_active) {
    logAuthEvent('login', null, userIp, false, 'User not found or inactive');
    throw createApiError.unauthorized('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(password, userWithPassword.password);
  if (!isPasswordValid) {
    logAuthEvent('login', userWithPassword.id, userIp, false, 'Invalid password');
    throw createApiError.unauthorized('Invalid credentials');
  }

  // Update last login time  
  await User.update(userWithPassword.id, { last_activity_date: new Date() });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(userWithPassword.id, userWithPassword.email);

  // Log successful login
  logAuthEvent('login', userWithPassword.id, userIp, true);

  logger.info(`User logged in: ${userWithPassword.email}`, {
    userId: userWithPassword.id,
    name: userWithPassword.name,
  });

  // Get user without password for response
  const user = await User.findById(userWithPassword.id);

  res.json({
    success: true,
    message: 'Login successful',
    user: user,
    token: accessToken
  });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createApiError.badRequest('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw createApiError.unauthorized('Invalid token type');
    }

    // Check if token exists in cache
    const cachedToken = await cache.get(`refresh_token:${decoded.userId}`);
    if (cachedToken !== refreshToken) {
      throw createApiError.unauthorized('Invalid refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.email);

    // Update cached refresh token
    await cache.set(`refresh_token:${decoded.userId}`, newRefreshToken, 7 * 24 * 60 * 60);

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createApiError.unauthorized('Invalid or expired refresh token');
    }
    throw error;
  }
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
      
      // Remove refresh token from cache
      await cache.del(`refresh_token:${decoded.userId}`);
      
      logAuthEvent('logout', decoded.userId, req.ip, true);
    } catch (error) {
      // Token might be invalid, but we still want to respond successfully
      logger.warn('Invalid refresh token during logout', { error: error.message });
    }
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', (req, res, next) => {
  // 인라인 인증 체크 (순환 참조 방지)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
}, asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const userResult = await query(`
    SELECT 
      u.user_id, u.email, u.username, u.display_name, u.profile_image_url,
      u.city, u.district, u.user_type, u.subscription_tier, u.language_level,
      u.created_at, u.last_login_at,
      up.total_points, up.current_level, up.current_streak_days,
      prof.learning_goals, prof.target_fluency_level
    FROM users u
    LEFT JOIN user_points up ON u.user_id = up.user_id
    LEFT JOIN user_profiles prof ON u.user_id = prof.user_id
    WHERE u.user_id = $1 AND u.account_status = 'active'
  `, [userId]);

  if (userResult.rows.length === 0) {
    throw createApiError.notFound('User not found');
  }

  const user = userResult.rows[0];

  res.json({
    success: true,
    data: {
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        profileImageUrl: user.profile_image_url,
        city: user.city,
        district: user.district,
        userType: user.user_type,
        subscriptionTier: user.subscription_tier,
        languageLevel: user.language_level,
        points: {
          total: user.total_points,
          level: user.current_level,
          streak: user.current_streak_days,
        },
        learningGoals: user.learning_goals,
        targetFluencyLevel: user.target_fluency_level,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    },
  });
}));

module.exports = router;