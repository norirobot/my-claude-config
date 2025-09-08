const express = require('express');
const router = express.Router();
const UserWallet = require('../models/UserWallet');
const PointTransaction = require('../models/PointTransaction');
const PointPackage = require('../models/PointPackage');

// GET /api/points/wallet/:userId - 사용자 지갑 조회
router.get('/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wallet = await UserWallet.findByUserId(userId);
    
    // 지갑이 없으면 생성
    if (!wallet) {
      wallet = await UserWallet.createWallet(userId, 0);
    }

    res.json({
      success: true,
      data: {
        user_id: wallet.user_id,
        balance: parseFloat(wallet.balance),
        pending_balance: parseFloat(wallet.pending_balance),
        last_updated: wallet.last_updated
      }
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet',
      error: error.message
    });
  }
});

// POST /api/points/charge - 포인트 충전
router.post('/charge', async (req, res) => {
  try {
    const { userId, amount, description = 'Points charged' } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or amount'
      });
    }

    const result = await UserWallet.updateBalance(userId, amount, description);

    res.json({
      success: true,
      message: 'Points charged successfully',
      data: result
    });
  } catch (error) {
    console.error('Error charging points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to charge points',
      error: error.message
    });
  }
});

// POST /api/points/spend - 포인트 사용
router.post('/spend', async (req, res) => {
  try {
    const { userId, amount, description = 'Points spent' } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or amount'
      });
    }

    // 음수로 변환하여 차감
    const result = await UserWallet.updateBalance(userId, -amount, description);

    res.json({
      success: true,
      message: 'Points spent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error spending points:', error);
    
    if (error.message.includes('Insufficient balance')) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to spend points',
      error: error.message
    });
  }
});

// GET /api/points/transactions/:userId - 거래 내역 조회
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, status } = req.query;
    
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type: type,
      status: status
    };

    const transactions = await PointTransaction.findByUserId(userId, filters);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// GET /api/points/stats/:userId - 거래 통계 조회
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30days' } = req.query;

    const stats = await PointTransaction.getTransactionStats(userId, period);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// GET /api/points/packages - 포인트 패키지 목록 조회
router.get('/packages', async (req, res) => {
  try {
    const packages = await PointPackage.findAll({ active: true });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
});

// GET /api/points/packages/:id - 특정 패키지 조회
router.get('/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await PointPackage.getPackageWithValue(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: pkg
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
      error: error.message
    });
  }
});

// POST /api/points/purchase - 패키지 구매 (시뮬레이션)
router.post('/purchase', async (req, res) => {
  try {
    const { userId, packageId, paymentMethod = 'simulation' } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Package ID are required'
      });
    }

    // 패키지 정보 조회
    const pkg = await PointPackage.findById(packageId);
    if (!pkg || !pkg.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or inactive'
      });
    }

    // 총 포인트 계산 (기본 포인트 + 보너스 포인트)
    const totalPoints = pkg.points + (pkg.bonus_points || 0);
    
    // 결제 시뮬레이션 (실제 결제 시스템 연동 전까지)
    const purchaseDescription = `Package purchase: ${pkg.package_name} (${totalPoints} points)`;
    
    // 포인트 충전
    const result = await UserWallet.updateBalance(userId, totalPoints, purchaseDescription);

    res.json({
      success: true,
      message: 'Package purchased successfully',
      data: {
        package: pkg,
        total_points: totalPoints,
        transaction: result,
        payment_method: paymentMethod,
        simulated: true
      }
    });
  } catch (error) {
    console.error('Error purchasing package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase package',
      error: error.message
    });
  }
});

module.exports = router;