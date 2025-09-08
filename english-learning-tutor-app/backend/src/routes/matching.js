const express = require('express');
const router = express.Router();
const MatchingService = require('../services/matchingService');
const { authenticateToken } = require('../middleware/auth');

// POST /api/matching/find - 맞춤 튜터 찾기
router.post('/find', authenticateToken, async (req, res) => {
  try {
    const preferences = req.body;
    const matches = await MatchingService.findBestMatches(preferences);

    res.json({
      success: true,
      data: matches,
      total: matches.length
    });
  } catch (error) {
    console.error('Error finding tutor matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find tutor matches',
      error: error.message
    });
  }
});

// GET /api/matching/recommended - 추천 튜터
router.get('/recommended', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 5 } = req.query;
    
    const recommended = await MatchingService.getRecommended(userId, parseInt(limit));

    res.json({
      success: true,
      data: recommended
    });
  } catch (error) {
    console.error('Error getting recommended tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommended tutors',
      error: error.message
    });
  }
});

// GET /api/matching/available-now - 지금 예약 가능한 튜터
router.get('/available-now', async (req, res) => {
  try {
    const available = await MatchingService.findAvailableNow();

    res.json({
      success: true,
      data: available,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error finding available tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find available tutors',
      error: error.message
    });
  }
});

module.exports = router;