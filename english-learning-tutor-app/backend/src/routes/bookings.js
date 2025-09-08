const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/bookings - 내 예약 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, userType = 'student' } = req.query;

    let bookings;
    if (userType === 'tutor') {
      // 튜터의 예약 목록
      bookings = await Booking.findByTutor(userId, status);
    } else {
      // 학생의 예약 목록  
      bookings = await Booking.findByStudent(userId, status);
    }

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// GET /api/bookings/upcoming - 예정된 예약 조회
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userType = 'student' } = req.query;

    const bookings = await Booking.findUpcoming(userId, userType);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message
    });
  }
});

// GET /api/bookings/stats - 예약 통계
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userType = 'student' } = req.query;

    const stats = await Booking.getStats(userId, userType);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking stats',
      error: error.message
    });
  }
});

// GET /api/bookings/:id - 특정 예약 상세 조회
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// POST /api/bookings - 새 예약 생성
router.post('/',
  authenticateToken,
  [
    body('tutor_id').isInt({ min: 1 }).withMessage('Valid tutor ID is required'),
    body('scheduled_at').isISO8601().withMessage('Valid scheduled date/time is required'),
    body('duration_minutes').optional().isInt({ min: 30, max: 180 }).withMessage('Duration must be between 30-180 minutes'),
    body('student_notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const studentId = req.user.userId;
      const { tutor_id, scheduled_at, duration_minutes = 60, student_notes } = req.body;

      // 시간 중복 확인
      const isAvailable = await Booking.checkAvailability(tutor_id, scheduled_at, duration_minutes);
      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is not available'
        });
      }

      const bookingData = {
        student_id: studentId,
        tutor_id,
        scheduled_at,
        duration_minutes,
        student_notes,
        status: 'pending'
      };

      const booking = await Booking.create(bookingData);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  }
);

// PATCH /api/bookings/:id/status - 예약 상태 변경
router.patch('/:id/status',
  authenticateToken,
  [
    body('status').isIn(['confirmed', 'cancelled', 'in_progress', 'completed', 'no_show']).withMessage('Invalid status'),
    body('cancel_reason').optional().isLength({ max: 500 }).withMessage('Cancel reason must be less than 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { status, cancel_reason } = req.body;

      const additionalData = {};
      if (status === 'cancelled' && cancel_reason) {
        additionalData.cancel_reason = cancel_reason;
      }

      const booking = await Booking.updateStatus(id, status, additionalData);

      res.json({
        success: true,
        message: `Booking status updated to ${status}`,
        data: booking
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status',
        error: error.message
      });
    }
  }
);

// POST /api/bookings/:id/review - 예약 리뷰 추가
router.post('/:id/review',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().isLength({ max: 1000 }).withMessage('Review must be less than 1000 characters'),
    body('userType').isIn(['student', 'tutor']).withMessage('User type must be student or tutor')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { rating, review, userType } = req.body;

      const booking = await Booking.addReview(id, userType, rating, review);

      res.json({
        success: true,
        message: 'Review added successfully',
        data: booking
      });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add review',
        error: error.message
      });
    }
  }
);

// DELETE /api/bookings/:id - 예약 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

module.exports = router;