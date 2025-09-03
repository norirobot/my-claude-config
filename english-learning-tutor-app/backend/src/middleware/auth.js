const jwt = require('jsonwebtoken');

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    // 토큰이 잘못되었더라도 통과시킴
    req.user = null;
    next();
  }
};

// 관리자 권한 확인 미들웨어
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required.'
    });
  }
  next();
};

// 사용자 타입별 권한 확인
const requireUserType = (userTypes) => {
  return (req, res, next) => {
    if (!req.user || !userTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required user types: ${userTypes.join(', ')}`
      });
    }
    next();
  };
};

// 자기 자신의 리소스만 접근 가능하도록 제한
const requireOwnership = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
  }

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

// 계정 상태 확인 미들웨어
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
  }

  if (req.user.account_status !== 'active') {
    return res.status(403).json({
      success: false,
      error: 'Account is not active. Please contact support.'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireUserType,
  requireOwnership,
  requireActiveAccount
};