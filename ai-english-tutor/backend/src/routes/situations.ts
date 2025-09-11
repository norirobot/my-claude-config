import express from 'express';
import { authenticateToken } from './auth';

const router = express.Router();

// 상황별 학습 시나리오 목록 조회
router.get('/', async (req, res) => {
  try {
    const situations = [
      {
        id: 1,
        title: 'Restaurant Order',
        description: 'Practice ordering food at a restaurant',
        level: 'beginner',
        estimatedTime: 10
      },
      {
        id: 2,
        title: 'Job Interview',
        description: 'Prepare for common job interview questions',
        level: 'intermediate',
        estimatedTime: 15
      },
      {
        id: 3,
        title: 'Business Meeting',
        description: 'Learn professional meeting vocabulary and phrases',
        level: 'advanced',
        estimatedTime: 20
      }
    ];

    res.json({ situations });
  } catch (error) {
    console.error('Get situations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 특정 상황 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 더미 데이터 (실제로는 데이터베이스에서 조회)
    const situation = {
      id: parseInt(id),
      title: 'Restaurant Order',
      description: 'Practice ordering food at a restaurant',
      level: 'beginner',
      estimatedTime: 10,
      dialogues: [
        {
          speaker: 'waiter',
          text: 'Good evening! Welcome to our restaurant. How many people in your party?'
        },
        {
          speaker: 'customer',
          text: 'Table for two, please.'
        }
      ],
      vocabulary: [
        { word: 'menu', meaning: '메뉴' },
        { word: 'order', meaning: '주문하다' },
        { word: 'reservation', meaning: '예약' }
      ]
    };

    res.json(situation);
  } catch (error) {
    console.error('Get situation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;