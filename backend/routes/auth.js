const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'your-secret-key-here'; // 실제 프로덕션에서는 환경변수로 관리

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 비밀번호를 입력해주세요.'
      });
    }

    const authenticatedUser = await user.authenticateUser(username, password);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    const token = jwt.sign(
      {
        userId: authenticatedUser.id,
        username: authenticatedUser.username,
        role: authenticatedUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: authenticatedUser
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
});

// 회원가입 (관리자만 학생 계정 생성 가능)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '학생 계정 생성 권한이 없습니다.'
      });
    }

    const { username, password, name, className, studentNumber } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    const newUser = await user.createUser({
      username,
      password,
      name,
      role: 'student',
      className,
      studentNumber
    });

    res.json({
      success: true,
      message: '학생 계정이 생성되었습니다.',
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({
        success: false,
        message: '이미 존재하는 사용자명입니다.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '계정 생성 중 오류가 발생했습니다.'
      });
    }
  }
});

// 토큰 검증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '토큰이 없습니다.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    req.user = user;
    next();
  });
}

// 토큰 검증 엔드포인트
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = { router, authenticateToken };
