import express from 'express';
import { authenticateToken } from './auth';

const router = express.Router();

// 학습 만족도 설문 제출
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { sessionId, ratings, feedback } = req.body;
    const userId = req.user.userId;

    // 실제 구현에서는 데이터베이스에 저장
    console.log('Survey submitted:', {
      userId,
      sessionId,
      ratings,
      feedback,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Survey submitted successfully',
      surveyId: Date.now() // 더미 ID
    });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 설문 질문 목록 조회
router.get('/questions', async (req, res) => {
  try {
    const questions = [
      {
        id: 1,
        text: 'How would you rate the AI tutor\'s responses?',
        type: 'rating',
        scale: 5
      },
      {
        id: 2,
        text: 'Was the conversation topic helpful?',
        type: 'rating',
        scale: 5
      },
      {
        id: 3,
        text: 'Any additional feedback?',
        type: 'text'
      }
    ];

    res.json({ questions });
  } catch (error) {
    console.error('Get survey questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;