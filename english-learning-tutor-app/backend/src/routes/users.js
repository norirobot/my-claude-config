const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, createApiError, validationErrorHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId);
  if (!user) {
    throw createApiError.notFound('User not found');
  }
  
  res.json({
    success: true,
    data: user
  });
}));

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  authenticateToken,
  [
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  ],
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const updateData = req.body;
    
    const updatedUser = await User.update(userId, updateData);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  })
);

/**
 * @route   GET /api/users/statistics
 * @desc    Get user learning statistics
 * @access  Private
 */
router.get('/statistics', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const statistics = await User.getStatistics(userId);
  
  res.json({
    success: true,
    data: statistics
  });
}));

/**
 * @route   POST /api/users/points
 * @desc    Update user points (for internal use)
 * @access  Private
 */
router.post('/points', 
  authenticateToken,
  [
    body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer')
  ],
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { points } = req.body;
    
    const updatedUser = await User.updatePoints(userId, points);
    
    res.json({
      success: true,
      message: 'Points updated successfully',
      data: {
        points: updatedUser.points
      }
    });
  })
);

/**
 * @route   POST /api/users/streak
 * @desc    Update user streak
 * @access  Private
 */
router.post('/streak', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const updatedUser = await User.updateStreak(userId);
  
  res.json({
    success: true,
    message: 'Streak updated successfully',
    data: {
      streak_days: updatedUser.streak_days
    }
  });
}));

module.exports = router;