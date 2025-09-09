const express = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, getDb } = require('../config/database-sqlite');
const { asyncHandler, createApiError, validationErrorHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/sessions/start
 * @desc    Start a new practice session
 * @access  Private
 */
router.post('/start',
  authenticateToken,
  [
    body('situation_type').notEmpty().withMessage('Situation type is required'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
  ],
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { situation_type, difficulty = 'medium', situation_title } = req.body;
    
    const sessionId = uuidv4();
    
    const [id] = await query('practice_sessions').insert({
      user_id: userId,
      session_id: sessionId,
      situation_type: situation_type,
      situation_title: situation_title,
      difficulty: difficulty,
      started_at: new Date(),
      status: 'active'
    }).returning('id');
    
    const session = await query('practice_sessions')
      .where('id', id)
      .first();
    
    res.json({
      success: true,
      message: 'Practice session started successfully',
      data: session
    });
  })
);

/**
 * @route   PUT /api/sessions/:sessionId/complete
 * @desc    Complete a practice session
 * @access  Private
 */
router.put('/:sessionId/complete',
  authenticateToken,
  [
    body('duration_seconds').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('overall_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Overall score must be between 0 and 100'),
    body('conversation_history').optional().isArray().withMessage('Conversation history must be an array')
  ],
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const {
      duration_seconds,
      overall_score,
      pronunciation_score,
      grammar_score,
      fluency_score,
      vocabulary_score,
      conversation_history,
      ai_feedback,
      points_earned = 0
    } = req.body;
    
    // Update session
    await query('practice_sessions')
      .where('session_id', sessionId)
      .where('user_id', userId)
      .update({
        ended_at: new Date(),
        duration_seconds,
        overall_score,
        pronunciation_score,
        grammar_score,
        fluency_score,
        vocabulary_score,
        conversation_history: JSON.stringify(conversation_history || []),
        ai_feedback: JSON.stringify(ai_feedback || {}),
        points_earned,
        status: 'completed',
        updated_at: new Date()
      });
    
    // Update user points
    if (points_earned > 0) {
      await query('users')
        .where('id', userId)
        .increment('points', points_earned);
    }
    
    const completedSession = await query('practice_sessions')
      .where('session_id', sessionId)
      .where('user_id', userId)
      .first();
    
    res.json({
      success: true,
      message: 'Practice session completed successfully',
      data: completedSession
    });
  })
);

/**
 * @route   GET /api/sessions
 * @desc    Get user's practice sessions
 * @access  Private
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { limit = 10, offset = 0, status } = req.query;
  
  let queryBuilder = query('practice_sessions')
    .where('user_id', userId)
    .orderBy('started_at', 'desc')
    .limit(parseInt(limit))
    .offset(parseInt(offset));
  
  if (status) {
    queryBuilder = queryBuilder.where('status', status);
  }
  
  const sessions = await queryBuilder;
  
  res.json({
    success: true,
    data: sessions
  });
}));

module.exports = router;