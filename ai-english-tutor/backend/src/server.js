const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'AI English Tutor Backend is running!'
  });
});

// Simple test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/api/tutors', (req, res) => {
  res.json({
    tutors: [
      {
        id: 1,
        name: 'Jennifer AI',
        specialties: ['Conversation', 'Grammar'],
        rating: 4.9,
        hourly_rate: 0,
        bio: 'AI tutor specialized in conversational English',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b667331f?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        specialties: ['Business English', 'IELTS'],
        rating: 4.8,
        hourly_rate: 25,
        bio: 'Native English speaker with 5 years of teaching experience',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ]
  });
});

// AI Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  // Simple AI response simulation
  const responses = [
    "That's a great point! Can you tell me more about your thoughts on this topic?",
    "I understand what you're saying. How would you handle this situation in your daily life?",
    "That's interesting! What made you think about it that way?",
    "Great job expressing your opinion! Could you give me an example?",
    "I see what you mean. What would you do differently next time?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const score = Math.floor(Math.random() * 21) + 80; // 80-100 score
  
  res.json({
    aiMessage: randomResponse,
    score: score,
    feedback: "Good vocabulary usage! Try to use more complex sentence structures.",
    timestamp: new Date().toISOString()
  });
});

// Points system endpoints
app.get('/api/points/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Mock user points data
  const pointsData = {
    userId: parseInt(userId),
    totalPoints: 1250,
    availablePoints: 850,
    usedPoints: 400,
    transactions: [
      {
        id: 1,
        type: 'earned',
        amount: 100,
        description: 'Daily login bonus',
        date: '2025-09-08'
      },
      {
        id: 2, 
        type: 'earned',
        amount: 50,
        description: 'Completed AI session',
        date: '2025-09-08'
      },
      {
        id: 3,
        type: 'spent',
        amount: -200,
        description: 'Booked tutor session',
        date: '2025-09-07'
      }
    ]
  };
  
  res.json(pointsData);
});

app.post('/api/points/earn', (req, res) => {
  const { userId, amount, description } = req.body;
  
  // Mock earning points
  res.json({
    success: true,
    message: `Earned ${amount} points`,
    newBalance: 1300,
    transaction: {
      id: Date.now(),
      type: 'earned',
      amount,
      description,
      date: new Date().toISOString().split('T')[0]
    }
  });
});

app.post('/api/points/spend', (req, res) => {
  const { userId, amount, description } = req.body;
  
  // Mock spending points
  if (amount > 850) {
    return res.status(400).json({
      error: 'Insufficient points',
      available: 850,
      required: amount
    });
  }
  
  res.json({
    success: true,
    message: `Spent ${amount} points`,
    newBalance: 850 - amount,
    transaction: {
      id: Date.now(),
      type: 'spent',
      amount: -amount,
      description,
      date: new Date().toISOString().split('T')[0]
    }
  });
});

// Payment endpoints
app.post('/api/payments/create', (req, res) => {
  const { userId, amount, packageType } = req.body;
  
  // Mock payment creation
  const payment = {
    paymentId: 'pay_' + Date.now(),
    userId,
    amount,
    packageType,
    status: 'pending',
    pointsToEarn: amount * 10, // 1원 = 10포인트
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    payment,
    paymentUrl: `https://payment.example.com/pay/${payment.paymentId}`
  });
});

app.post('/api/payments/verify', (req, res) => {
  const { paymentId } = req.body;
  
  // Mock payment verification
  res.json({
    success: true,
    status: 'completed',
    pointsEarned: 1000,
    message: 'Payment verified and points added!'
  });
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
  res.json({
    user: {
      name: 'User',
      level: 3,
      experiencePoints: 1250
    },
    progress: {
      totalSessions: 15,
      totalStudyHours: 12.5,
      avgSessionScore: 87,
      currentStreak: 5,
      longestStreak: 8
    },
    recentSessions: [
      {
        id: 1,
        topic: 'Daily Conversation',
        score: 92,
        duration: 25,
        date: '2025-09-08'
      },
      {
        id: 2,
        topic: 'Business English',
        score: 85,
        duration: 30,
        date: '2025-09-07'
      }
    ],
    weeklyStats: [
      { date: '2025-09-02', sessions: 2, avgScore: 88 },
      { date: '2025-09-03', sessions: 1, avgScore: 85 },
      { date: '2025-09-04', sessions: 3, avgScore: 90 },
      { date: '2025-09-05', sessions: 2, avgScore: 87 },
      { date: '2025-09-06', sessions: 1, avgScore: 92 },
      { date: '2025-09-07', sessions: 2, avgScore: 89 },
      { date: '2025-09-08', sessions: 1, avgScore: 94 }
    ]
  });
});

// Gamification - Levels & Achievements API
app.get('/api/levels/:userId', (req, res) => {
  const { userId } = req.params;
  
  const levelData = {
    currentLevel: 5,
    experience: 1750,
    experienceToNextLevel: 2000,
    experienceInCurrentLevel: 1750 - 1500, // 현재 레벨에서의 경험치
    experienceForCurrentLevel: 500, // 현재 레벨 달성에 필요했던 경험치
    levelName: 'Intermediate Speaker',
    levelDescription: '중급 수준의 영어 실력',
    perks: [
      'AI 튜터와 무제한 대화',
      '전문 튜터 예약 할인 10%',
      '고급 학습 자료 접근'
    ],
    nextLevelName: 'Advanced Speaker',
    nextLevelPerks: [
      'AI 튜터와 무제한 대화',
      '전문 튜터 예약 할인 15%', 
      '고급 학습 자료 접근',
      '맞춤형 학습 계획 제공'
    ]
  };
  
  res.json(levelData);
});

app.get('/api/achievements/:userId', (req, res) => {
  const { userId } = req.params;
  
  const achievements = {
    unlocked: [
      {
        id: 'first_chat',
        name: 'First Words',
        description: '첫 AI 대화 완료',
        icon: '💬',
        category: 'milestone',
        unlockedAt: '2025-09-01',
        reward: '50 포인트'
      },
      {
        id: 'streak_7',
        name: 'Week Warrior', 
        description: '7일 연속 학습',
        icon: '🔥',
        category: 'consistency',
        unlockedAt: '2025-09-07',
        reward: '200 포인트'
      },
      {
        id: 'score_90',
        name: 'Excellence',
        description: '평균 점수 90점 달성',
        icon: '⭐',
        category: 'performance',
        unlockedAt: '2025-09-06',
        reward: '100 포인트'
      },
      {
        id: 'sessions_50',
        name: 'Conversationalist',
        description: '50회 대화 세션 완료',
        icon: '🎯',
        category: 'milestone',
        unlockedAt: '2025-09-05',
        reward: '300 포인트'
      }
    ],
    inProgress: [
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: '30일 연속 학습',
        icon: '🏆',
        category: 'consistency',
        progress: 15,
        target: 30,
        reward: '1000 포인트'
      },
      {
        id: 'score_95',
        name: 'Perfectionist',
        description: '평균 점수 95점 달성',
        icon: '💎',
        category: 'performance', 
        progress: 87,
        target: 95,
        reward: '500 포인트'
      }
    ],
    locked: [
      {
        id: 'sessions_100',
        name: 'Dedicated Learner',
        description: '100회 대화 세션 완료',
        icon: '🎖️',
        category: 'milestone',
        progress: 52,
        target: 100,
        reward: '750 포인트'
      },
      {
        id: 'tutor_booking',
        name: 'Human Connection',
        description: '첫 실제 튜터 예약',
        icon: '👥',
        category: 'social',
        progress: 0,
        target: 1,
        reward: '250 포인트'
      }
    ],
    stats: {
      totalUnlocked: 4,
      totalAvailable: 8,
      totalPointsEarned: 650,
      favoriteCategory: 'milestone'
    }
  };
  
  res.json(achievements);
});

app.post('/api/achievements/unlock', (req, res) => {
  const { userId, achievementId } = req.body;
  
  // Mock achievement unlock
  res.json({
    success: true,
    message: 'Achievement unlocked!',
    achievement: {
      id: achievementId,
      name: 'New Achievement',
      pointsEarned: 100
    }
  });
});

// Leaderboard API
app.get('/api/leaderboard', (req, res) => {
  const { type = 'weekly' } = req.query;
  
  const leaderboardData = {
    type,
    currentUser: {
      rank: 23,
      score: 1750,
      name: 'User'
    },
    topUsers: [
      {
        rank: 1,
        name: 'Jessica Kim',
        score: 2850,
        level: 8,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b667331f?w=50&h=50&fit=crop&crop=face'
      },
      {
        rank: 2,
        name: 'Michael Chen',
        score: 2720,
        level: 7,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
      },
      {
        rank: 3,
        name: 'Sarah Wilson',
        score: 2650,
        level: 7,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
      },
      {
        rank: 4,
        name: 'David Park',
        score: 2480,
        level: 6,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
      },
      {
        rank: 5,
        name: 'Emily Zhang',
        score: 2350,
        level: 6,
        avatar: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=50&h=50&fit=crop&crop=face'
      }
    ]
  };
  
  res.json(leaderboardData);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🧑‍🎓 Tutors: http://localhost:${PORT}/api/tutors`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/api/chat`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
});