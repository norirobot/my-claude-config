import express from 'express';
import { getDatabase } from '../database/init';
import { promisify } from 'util';
import { authenticateToken } from './auth';

const router = express.Router();

// 대시보드 전체 데이터 조회
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));

    // 사용자 기본 정보
    const user: any = await get(
      'SELECT name, level, experience_points FROM users WHERE id = ?',
      [userId]
    );

    // 학습 진도 정보
    const progress: any = await get(
      'SELECT * FROM learning_progress WHERE user_id = ?',
      [userId]
    );

    // 최근 채팅 세션들
    const recentSessions = await all(`
      SELECT 
        id,
        ai_tutor,
        topic,
        session_score,
        session_duration,
        created_at,
        ended_at
      FROM chat_sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [userId]);

    // 다가오는 예약들
    const upcomingBookings = await all(`
      SELECT 
        b.id,
        b.scheduled_at,
        b.duration_minutes,
        b.status,
        t.name as tutor_name,
        t.avatar_url as tutor_avatar
      FROM bookings b
      JOIN tutors t ON b.tutor_id = t.id
      WHERE b.user_id = ? 
      AND b.scheduled_at > datetime('now')
      AND b.status IN ('pending', 'confirmed')
      ORDER BY b.scheduled_at ASC
      LIMIT 3
    `, [userId]);

    // 주간 학습 통계
    const weeklyStats = await getWeeklyStats(userId);

    // 성과 분석
    const analytics = calculateAnalytics(progress, recentSessions);

    res.json({
      user: {
        name: user?.name || 'User',
        level: user?.level || 1,
        experiencePoints: user?.experience_points || 0
      },
      progress: {
        totalSessions: progress?.total_sessions || 0,
        totalStudyHours: progress?.total_study_hours || 0,
        avgSessionScore: progress?.avg_session_score || 0,
        currentStreak: progress?.current_streak || 0,
        longestStreak: progress?.longest_streak || 0,
        lastStudyDate: progress?.last_study_date || null
      },
      recentSessions: recentSessions.map(session => ({
        ...session,
        duration: session.session_duration || 0,
        score: session.session_score || 0
      })),
      upcomingBookings,
      weeklyStats,
      analytics
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 학습 통계 조회
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'week' } = req.query; // week, month, year

    const db = getDatabase();
    const all = promisify(db.all.bind(db));

    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = "WHERE user_id = ? AND created_at >= date('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "WHERE user_id = ? AND created_at >= date('now', '-30 days')";
        break;
      case 'year':
        dateFilter = "WHERE user_id = ? AND created_at >= date('now', '-365 days')";
        break;
      default:
        dateFilter = "WHERE user_id = ? AND created_at >= date('now', '-7 days')";
    }

    // 기간별 세션 통계
    const sessionStats = await all(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as session_count,
        AVG(session_score) as avg_score,
        SUM(session_duration) as total_duration
      FROM chat_sessions 
      ${dateFilter}
      GROUP BY date(created_at)
      ORDER BY date ASC
    `, [userId]);

    // 주제별 통계
    const topicStats = await all(`
      SELECT 
        COALESCE(topic, 'General Conversation') as topic,
        COUNT(*) as session_count,
        AVG(session_score) as avg_score
      FROM chat_sessions 
      ${dateFilter}
      GROUP BY topic
      ORDER BY session_count DESC
    `, [userId]);

    // 시간대별 학습 패턴
    const hourlyPattern = await all(`
      SELECT 
        CAST(strftime('%H', created_at) as INTEGER) as hour,
        COUNT(*) as session_count,
        AVG(session_score) as avg_score
      FROM chat_sessions 
      ${dateFilter}
      GROUP BY hour
      ORDER BY hour ASC
    `, [userId]);

    res.json({
      period,
      sessionStats,
      topicStats,
      hourlyPattern,
      summary: {
        totalSessions: sessionStats.reduce((sum, stat) => sum + stat.session_count, 0),
        avgScore: sessionStats.length > 0 ? 
          sessionStats.reduce((sum, stat) => sum + stat.avg_score, 0) / sessionStats.length : 0,
        totalHours: Math.round(sessionStats.reduce((sum, stat) => sum + (stat.total_duration || 0), 0) / 60)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 학습 목표 설정
router.post('/goals', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { weeklyHours, targetScore, studyStreak } = req.body;

    // 목표를 사용자의 achievements에 저장 (JSON 형태)
    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));

    const progress: any = await get('SELECT achievements FROM learning_progress WHERE user_id = ?', [userId]);
    
    let achievements = [];
    try {
      achievements = JSON.parse(progress?.achievements || '[]');
    } catch {
      achievements = [];
    }

    // 기존 목표 제거하고 새 목표 추가
    achievements = achievements.filter((a: any) => a.type !== 'goal');
    
    if (weeklyHours) {
      achievements.push({
        type: 'goal',
        category: 'study_hours',
        target: weeklyHours,
        current: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    if (targetScore) {
      achievements.push({
        type: 'goal',
        category: 'avg_score',
        target: targetScore,
        current: progress?.avg_session_score || 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    if (studyStreak) {
      achievements.push({
        type: 'goal',
        category: 'streak',
        target: studyStreak,
        current: progress?.current_streak || 0,
        deadline: new Date(Date.now() + studyStreak * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    await run(
      'UPDATE learning_progress SET achievements = ? WHERE user_id = ?',
      [JSON.stringify(achievements), userId]
    );

    res.json({
      message: 'Goals set successfully',
      goals: achievements.filter((a: any) => a.type === 'goal')
    });
  } catch (error) {
    console.error('Set goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 업적 조회
router.get('/achievements', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const db = getDatabase();
    const get = promisify(db.get.bind(db));

    const progress: any = await get('SELECT achievements FROM learning_progress WHERE user_id = ?', [userId]);
    
    let achievements = [];
    try {
      achievements = JSON.parse(progress?.achievements || '[]');
    } catch {
      achievements = [];
    }

    // 기본 업적들 추가
    const defaultAchievements = [
      {
        id: 'first_session',
        name: 'First Steps',
        description: 'Complete your first AI conversation',
        icon: '🎯',
        unlocked: progress?.total_sessions > 0,
        progress: Math.min(progress?.total_sessions || 0, 1),
        target: 1
      },
      {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        unlocked: progress?.current_streak >= 7,
        progress: Math.min(progress?.current_streak || 0, 7),
        target: 7
      },
      {
        id: 'high_score',
        name: 'Excellence',
        description: 'Achieve an average score of 90+',
        icon: '⭐',
        unlocked: progress?.avg_session_score >= 90,
        progress: Math.min(progress?.avg_session_score || 0, 90),
        target: 90
      }
    ];

    res.json({
      achievements: defaultAchievements,
      goals: achievements.filter((a: any) => a.type === 'goal'),
      totalUnlocked: defaultAchievements.filter(a => a.unlocked).length
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 주간 통계 계산 함수
async function getWeeklyStats(userId: number): Promise<any> {
  const db = getDatabase();
  const all = promisify(db.all.bind(db));

  const weeklyData = await all(`
    SELECT 
      date(created_at) as date,
      COUNT(*) as sessions,
      AVG(session_score) as avg_score,
      SUM(session_duration) as total_minutes
    FROM chat_sessions 
    WHERE user_id = ? 
    AND created_at >= date('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `, [userId]);

  const today = new Date();
  const weekStats = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = weeklyData.find(d => d.date === dateStr);
    weekStats.push({
      date: dateStr,
      sessions: dayData?.sessions || 0,
      avgScore: dayData?.avg_score || 0,
      totalMinutes: dayData?.total_minutes || 0
    });
  }

  return weekStats;
}

// 성과 분석 계산 함수
function calculateAnalytics(progress: any, recentSessions: any[]): any {
  if (!progress || recentSessions.length === 0) {
    return {
      growthRate: 0,
      efficiency: 0,
      consistency: 0,
      insights: ['Start your learning journey with AI conversations!']
    };
  }

  // 성장률 계산 (최근 5세션 vs 전체 평균)
  const recentAvgScore = recentSessions.reduce((sum, s) => sum + (s.session_score || 0), 0) / recentSessions.length;
  const growthRate = Math.round(((recentAvgScore / (progress.avg_session_score || 1)) - 1) * 100);

  // 학습 효율성 (점수 대비 시간)
  const avgDuration = recentSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0) / recentSessions.length;
  const efficiency = avgDuration > 0 ? Math.round(recentAvgScore / (avgDuration / 60)) : 0;

  // 일관성 (연속 학습일 대비 총 세션)
  const consistency = progress.total_sessions > 0 ? 
    Math.round((progress.current_streak / progress.total_sessions) * 100) : 0;

  // 인사이트 생성
  const insights = [];
  if (growthRate > 10) insights.push('📈 Your scores are improving rapidly!');
  if (progress.current_streak >= 7) insights.push('🔥 Amazing streak! Keep it up!');
  if (recentAvgScore >= 90) insights.push('⭐ Excellent performance in recent sessions!');
  if (efficiency > 1) insights.push('⚡ You\'re learning very efficiently!');
  if (insights.length === 0) insights.push('💪 Keep practicing to see more insights!');

  return {
    growthRate,
    efficiency,
    consistency,
    insights
  };
}

export { router as dashboardRoutes };