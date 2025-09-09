const express = require('express');
const router = express.Router();
// Mock authentication for testing (remove when auth is configured)
const authenticateToken = (req, res, next) => {
  req.user = { id: 'test-user-123', email: 'test@example.com' };
  next();
};
const conversationController = require('../controllers/conversationController');
const { uploadMiddleware } = require('../middleware/upload');

// 상황별 연습 목록 조회
router.get('/situations', authenticateToken, conversationController.getSituations);

// 특정 상황 상세 정보 조회
router.get('/situations/:id', authenticateToken, conversationController.getSituationDetail);

// 대화 세션 시작
router.post('/sessions/start', authenticateToken, conversationController.startSession);

// 대화 메시지 전송 (사용자 응답)
router.post('/sessions/:sessionId/message', authenticateToken, conversationController.sendMessage);

// 대화 세션 종료 및 평가
router.post('/sessions/:sessionId/end', authenticateToken, conversationController.endSession);

// 음성 메시지 전송 (파일 업로드)
router.post('/sessions/:sessionId/voice', 
  authenticateToken, 
  uploadMiddleware.singleAudio,
  uploadMiddleware.handleUploadError,
  conversationController.sendVoiceMessage
);

// 연습 기록 조회
router.get('/history', authenticateToken, conversationController.getHistory);

// 상황별 진행률 조회
router.get('/progress', authenticateToken, conversationController.getProgress);

module.exports = router;