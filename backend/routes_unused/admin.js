const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// 관리자 권한 확인 미들웨어
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.'
    });
  }
  next();
}

// 모든 학생 조회
router.get('/students', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const students = await user.getAllStudents();
    res.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: '학생 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 학생 삭제
router.delete('/students/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const studentId = req.params.id;
    const deleted = await user.deleteStudent(studentId);

    if (deleted) {
      res.json({
        success: true,
        message: '학생이 삭제되었습니다.'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: '학생 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 특정 학생의 진도 조회
router.get('/students/:id/progress', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const studentId = req.params.id;
    const progress = await user.getStudentProgress(studentId);
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: '학생 진도 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 학생의 평가 결과 조회
router.get('/students/:id/assessments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const studentId = req.params.id;
    const assessments = await user.getStudentAssessments(studentId);
    res.json({
      success: true,
      assessments
    });
  } catch (error) {
    console.error('Get student assessments error:', error);
    res.status(500).json({
      success: false,
      message: '학생 평가 결과 조회 중 오류가 발생했습니다.'
    });
  }
});

// 전체 통계 조회
router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const students = await user.getAllStudents();
    const activeStudents = students.filter(s => s.is_active).length;
    const totalStudents = students.length;

    // 추가 통계를 위해 더 복잡한 쿼리들을 실행할 수 있음
    res.json({
      success: true,
      statistics: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
