const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

const user = new User();

// 학생 권한 확인 미들웨어
function requireStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false, 
      message: '학생 권한이 필요합니다.' 
    });
  }
  next();
}

// 내 진도 조회
router.get('/progress', authenticateToken, requireStudent, async (req, res) => {
  try {
    const progress = await user.getStudentProgress(req.user.userId);
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: '진도 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 진도 저장
router.post('/progress', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { levelId, chapterId, completed, stars, code, completionTime } = req.body;
    
    const progressId = await user.saveProgress(
      req.user.userId, 
      levelId, 
      chapterId, 
      completed, 
      stars, 
      code, 
      completionTime
    );

    res.json({
      success: true,
      message: '진도가 저장되었습니다.',
      progressId
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: '진도 저장 중 오류가 발생했습니다.' 
    });
  }
});

// 내 평가 결과 조회
router.get('/assessments', authenticateToken, requireStudent, async (req, res) => {
  try {
    const assessments = await user.getStudentAssessments(req.user.userId);
    res.json({
      success: true,
      assessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ 
      success: false, 
      message: '평가 결과 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 평가 결과 저장
router.post('/assessments', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { assessmentType, assessmentName, score, maxScore, details } = req.body;
    
    const assessmentId = await user.saveAssessmentResult(
      req.user.userId, 
      assessmentType, 
      assessmentName, 
      score, 
      maxScore, 
      details
    );

    res.json({
      success: true,
      message: '평가 결과가 저장되었습니다.',
      assessmentId
    });
  } catch (error) {
    console.error('Save assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: '평가 결과 저장 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;