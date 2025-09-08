const express = require('express');
const router = express.Router();
const TutorEarnings = require('../models/TutorEarnings');
const SessionEarnings = require('../models/SessionEarnings');

// GET /api/earnings/tutor/:tutorId - 튜터 수익 조회
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    let earnings = await TutorEarnings.findByTutorId(tutorId);
    
    // 수익 계정이 없으면 생성
    if (!earnings) {
      earnings = await TutorEarnings.createEarningsAccount(tutorId);
    }

    res.json({
      success: true,
      data: {
        tutor_id: earnings.tutor_id,
        total_earned: parseFloat(earnings.total_earned),
        available_balance: parseFloat(earnings.available_balance),
        pending_balance: parseFloat(earnings.pending_balance),
        withdrawn_total: parseFloat(earnings.withdrawn_total),
        total_sessions: parseInt(earnings.total_sessions),
        average_rating: parseFloat(earnings.average_rating),
        last_payout: earnings.last_payout
      }
    });
  } catch (error) {
    console.error('Error fetching tutor earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor earnings',
      error: error.message
    });
  }
});

// GET /api/earnings/tutor/:tutorId/stats - 튜터 수익 통계
router.get('/tutor/:tutorId/stats', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { period = '30days' } = req.query;

    const stats = await TutorEarnings.getTutorStats(tutorId, period);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching tutor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor statistics',
      error: error.message
    });
  }
});

// GET /api/earnings/tutor/:tutorId/sessions - 튜터 세션별 수익 내역
router.get('/tutor/:tutorId/sessions', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      status: status,
      dateFrom: dateFrom,
      dateTo: dateTo
    };

    const sessions = await SessionEarnings.findByTutorId(tutorId, filters);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sessions.length
      }
    });
  } catch (error) {
    console.error('Error fetching session earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session earnings',
      error: error.message
    });
  }
});

// POST /api/earnings/session - 세션 완료 시 수익 생성/업데이트
router.post('/session', async (req, res) => {
  try {
    const { bookingId, sessionDate, completed = false } = req.body;

    if (!bookingId || !sessionDate) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and session date are required'
      });
    }

    // 기존 세션 수익 레코드 확인
    let sessionEarnings = await SessionEarnings.findByBookingId(bookingId);
    
    if (!sessionEarnings) {
      // 새 세션 수익 레코드 생성
      sessionEarnings = await SessionEarnings.createFromBooking(bookingId, sessionDate);
    }

    // 세션이 완료되었으면 상태 업데이트
    if (completed && sessionEarnings.status === 'pending') {
      sessionEarnings = await SessionEarnings.updateStatus(
        sessionEarnings.earnings_id, 
        'completed'
      );

      // 튜터 수익 계정 업데이트 (pending에서 available로 이동)
      await TutorEarnings.movePendingToAvailable(
        sessionEarnings.tutor_id, 
        sessionEarnings.tutor_earning
      );
    }

    res.json({
      success: true,
      message: 'Session earnings processed successfully',
      data: sessionEarnings
    });
  } catch (error) {
    console.error('Error processing session earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process session earnings',
      error: error.message
    });
  }
});

// POST /api/earnings/complete-session/:earningsId - 세션 완료 처리
router.post('/complete-session/:earningsId', async (req, res) => {
  try {
    const { earningsId } = req.params;
    const { rating } = req.body;

    // 세션 수익 상태를 완료로 업데이트
    const sessionEarnings = await SessionEarnings.updateStatus(earningsId, 'completed');
    
    if (!sessionEarnings) {
      return res.status(404).json({
        success: false,
        message: 'Session earnings not found'
      });
    }

    // pending에서 available로 이동
    await TutorEarnings.movePendingToAvailable(
      sessionEarnings.tutor_id, 
      sessionEarnings.tutor_earning
    );

    // 평점이 제공되면 업데이트
    if (rating && rating >= 1 && rating <= 5) {
      await TutorEarnings.updateRating(sessionEarnings.tutor_id, rating);
    }

    res.json({
      success: true,
      message: 'Session completed and earnings processed',
      data: sessionEarnings
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
});

// GET /api/earnings/platform/stats - 플랫폼 전체 수익 통계 (관리자용)
router.get('/platform/stats', async (req, res) => {
  try {
    const { dateFrom, dateTo, tutorId } = req.query;
    
    const filters = {
      tutorId: tutorId,
      dateFrom: dateFrom,
      dateTo: dateTo
    };

    const totalEarnings = await SessionEarnings.getTotalEarnings(filters);

    res.json({
      success: true,
      data: totalEarnings
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
});

// GET /api/earnings/platform/by-period - 기간별 수익 통계
router.get('/platform/by-period', async (req, res) => {
  try {
    const { period = 'month', tutorId } = req.query;
    
    const earningsByPeriod = await SessionEarnings.getEarningsByPeriod(period, tutorId);

    res.json({
      success: true,
      data: earningsByPeriod
    });
  } catch (error) {
    console.error('Error fetching earnings by period:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings by period',
      error: error.message
    });
  }
});

// GET /api/earnings/all-tutors - 모든 튜터 수익 조회 (관리자용)
router.get('/all-tutors', async (req, res) => {
  try {
    const { page = 1, limit = 20, minEarnings, orderBy } = req.query;
    
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      minEarnings: minEarnings,
      orderBy: orderBy
    };

    const allEarnings = await TutorEarnings.getAllTutorEarnings(filters);

    res.json({
      success: true,
      data: allEarnings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allEarnings.length
      }
    });
  } catch (error) {
    console.error('Error fetching all tutor earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all tutor earnings',
      error: error.message
    });
  }
});

// GET /api/earnings/fee-rate - 현재 플랫폼 수수료율 조회
router.get('/fee-rate', async (req, res) => {
  try {
    const feeRate = await SessionEarnings.getCurrentFeeRate();

    res.json({
      success: true,
      data: {
        setting_name: feeRate.setting_name,
        fee_rate: parseFloat(feeRate.fee_rate),
        fee_percentage: (parseFloat(feeRate.fee_rate) * 100).toFixed(1) + '%',
        description: feeRate.description,
        effective_from: feeRate.effective_from,
        effective_until: feeRate.effective_until
      }
    });
  } catch (error) {
    console.error('Error fetching fee rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee rate',
      error: error.message
    });
  }
});

// POST /api/earnings/calculate - 세션 가격 기반 수익 계산
router.post('/calculate', async (req, res) => {
  try {
    const { sessionPrice, platformFeeRate } = req.body;

    if (!sessionPrice || sessionPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid session price is required'
      });
    }

    const feeRate = platformFeeRate || (await SessionEarnings.getCurrentFeeRate()).fee_rate;
    const earnings = SessionEarnings.calculateEarnings(sessionPrice, feeRate);

    res.json({
      success: true,
      data: {
        ...earnings,
        fee_percentage: (feeRate * 100).toFixed(1) + '%'
      }
    });
  } catch (error) {
    console.error('Error calculating earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate earnings',
      error: error.message
    });
  }
});

module.exports = router;