const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');

// GET /api/tutors - 튜터 목록 조회
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // Handle invalid page/limit values gracefully
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const filters = { page: safePage, limit: safeLimit };
    const tutors = await Tutor.findAll(filters);
    res.json({
      success: true,
      data: tutors,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: tutors.length
      }
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutors',
      error: error.message
    });
  }
});

// GET /api/tutors/:id - 특정 튜터 상세 정보
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findById(id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    console.error('Error fetching tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor',
      error: error.message
    });
  }
});

module.exports = router;
