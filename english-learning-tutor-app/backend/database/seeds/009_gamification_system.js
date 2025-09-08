exports.seed = async function(knex) {
  // User Levels 시드 데이터
  await knex('user_levels').del();
  await knex('user_levels').insert([
    {
      id: 1,
      level_name: 'Beginner',
      required_xp: 0,
      points_multiplier: 1,
      benefits: JSON.stringify({
        features: ['기본 AI 대화', '발음 교정'],
        daily_challenges: 1,
        tutor_sessions: 2
      }),
      level_color: '#2ecc71',
      level_icon: '🌱',
      level_order: 1
    },
    {
      id: 2,
      level_name: 'Elementary',
      required_xp: 500,
      points_multiplier: 1.1,
      benefits: JSON.stringify({
        features: ['상황별 대화', '문법 체크', '일일 도전과제 추가'],
        daily_challenges: 2,
        tutor_sessions: 3
      }),
      level_color: '#3498db',
      level_icon: '📚',
      level_order: 2
    },
    {
      id: 3,
      level_name: 'Intermediate',
      required_xp: 1500,
      points_multiplier: 1.2,
      benefits: JSON.stringify({
        features: ['고급 AI 피드백', '개인별 학습 플랜', '튜터 할인 5%'],
        daily_challenges: 3,
        tutor_sessions: 5
      }),
      level_color: '#e74c3c',
      level_icon: '🎯',
      level_order: 3
    },
    {
      id: 4,
      level_name: 'Advanced',
      required_xp: 3500,
      points_multiplier: 1.3,
      benefits: JSON.stringify({
        features: ['원어민 발음 분석', 'IELTS/TOEFL 대비', '튜터 할인 10%'],
        daily_challenges: 4,
        tutor_sessions: 8
      }),
      level_color: '#9b59b6',
      level_icon: '🏆',
      level_order: 4
    },
    {
      id: 5,
      level_name: 'Expert',
      required_xp: 7500,
      points_multiplier: 1.5,
      benefits: JSON.stringify({
        features: ['무제한 AI 세션', '프리미엄 튜터 우선권', '튜터 할인 15%'],
        daily_challenges: 5,
        tutor_sessions: 999
      }),
      level_color: '#f39c12',
      level_icon: '👑',
      level_order: 5
    }
  ]);
  
  // Achievements 시드 데이터
  await knex('achievements').del();
  await knex('achievements').insert([
    // Learning 카테고리
    {
      id: 1,
      achievement_key: 'first_session',
      title: '첫걸음',
      description: '첫 번째 영어 학습 세션 완료',
      category: 'learning',
      xp_reward: 50,
      point_reward: 100,
      badge_icon: '🌟',
      badge_color: '#f39c12',
      requirements: JSON.stringify({type: 'session_count', count: 1})
    },
    {
      id: 2,
      achievement_key: 'session_master',
      title: '세션 마스터',
      description: '10개의 학습 세션 완료',
      category: 'learning',
      xp_reward: 200,
      point_reward: 500,
      badge_icon: '📚',
      badge_color: '#3498db',
      requirements: JSON.stringify({type: 'session_count', count: 10})
    },
    {
      id: 3,
      achievement_key: 'study_marathon',
      title: '학습 마라톤',
      description: '50개의 학습 세션 완료',
      category: 'learning',
      xp_reward: 500,
      point_reward: 1000,
      badge_icon: '🏃‍♂️',
      badge_color: '#e74c3c',
      requirements: JSON.stringify({type: 'session_count', count: 50})
    },
    
    // Streak 카테고리
    {
      id: 4,
      achievement_key: 'streak_week',
      title: '일주일 연속',
      description: '7일 연속 학습 달성',
      category: 'streak',
      xp_reward: 300,
      point_reward: 700,
      badge_icon: '🔥',
      badge_color: '#e67e22',
      requirements: JSON.stringify({type: 'streak_days', count: 7})
    },
    {
      id: 5,
      achievement_key: 'streak_month',
      title: '한달 챔피언',
      description: '30일 연속 학습 달성',
      category: 'streak',
      xp_reward: 800,
      point_reward: 2000,
      badge_icon: '👑',
      badge_color: '#9b59b6',
      requirements: JSON.stringify({type: 'streak_days', count: 30})
    },
    
    // Milestone 카테고리
    {
      id: 6,
      achievement_key: 'pronunciation_master',
      title: '발음 마스터',
      description: '발음 점수 평균 85점 이상 달성',
      category: 'milestone',
      xp_reward: 400,
      point_reward: 800,
      badge_icon: '🎤',
      badge_color: '#1abc9c',
      requirements: JSON.stringify({type: 'avg_score', score_type: 'pronunciation', threshold: 85})
    },
    {
      id: 7,
      achievement_key: 'grammar_guru',
      title: '문법 구루',
      description: '문법 점수 평균 90점 이상 달성',
      category: 'milestone',
      xp_reward: 450,
      point_reward: 900,
      badge_icon: '📝',
      badge_color: '#34495e',
      requirements: JSON.stringify({type: 'avg_score', score_type: 'grammar', threshold: 90})
    },
    
    // Social 카테고리
    {
      id: 8,
      achievement_key: 'first_tutor',
      title: '실전 도전',
      description: '첫 번째 튜터 세션 완료',
      category: 'social',
      xp_reward: 100,
      point_reward: 200,
      badge_icon: '🎓',
      badge_color: '#2c3e50',
      requirements: JSON.stringify({type: 'tutor_session_count', count: 1})
    },
    {
      id: 9,
      achievement_key: 'social_butterfly',
      title: '소셜 버터플라이',
      description: '5명의 다른 튜터와 세션 진행',
      category: 'social',
      xp_reward: 350,
      point_reward: 750,
      badge_icon: '🦋',
      badge_color: '#8e44ad',
      requirements: JSON.stringify({type: 'unique_tutors', count: 5})
    },
    
    // Challenge 카테고리
    {
      id: 10,
      achievement_key: 'daily_challenger',
      title: '일일 도전자',
      description: '첫 번째 일일 도전과제 완료',
      category: 'challenge',
      xp_reward: 75,
      point_reward: 150,
      badge_icon: '⚡',
      badge_color: '#f1c40f',
      requirements: JSON.stringify({type: 'daily_challenges', count: 1})
    },
    {
      id: 11,
      achievement_key: 'challenge_champion',
      title: '도전 챔피언',
      description: '10개의 일일 도전과제 완료',
      category: 'challenge',
      xp_reward: 400,
      point_reward: 800,
      badge_icon: '🏅',
      badge_color: '#e74c3c',
      requirements: JSON.stringify({type: 'daily_challenges', count: 10})
    }
  ]);
  
  // Daily Challenges 템플릿 (당일 날짜로 생성)
  const today = new Date().toISOString().split('T')[0];
  await knex('daily_challenges').del();
  await knex('daily_challenges').insert([
    {
      id: 1,
      challenge_date: today,
      challenge_type: 'session_count',
      title: '세션 챌린지',
      description: '오늘 3개의 학습 세션을 완료하세요',
      requirements: JSON.stringify({
        session_count: 3,
        min_duration_seconds: 300
      }),
      xp_reward: 100,
      point_reward: 200,
      difficulty: 'normal'
    },
    {
      id: 2,
      challenge_date: today,
      challenge_type: 'practice_time',
      title: '집중 학습',
      description: '총 20분 이상 학습하세요',
      requirements: JSON.stringify({
        total_practice_minutes: 20
      }),
      xp_reward: 80,
      point_reward: 150,
      difficulty: 'easy'
    },
    {
      id: 3,
      challenge_date: today,
      challenge_type: 'pronunciation_focus',
      title: '발음 완벽주의',
      description: '발음 점수 80점 이상으로 세션을 완료하세요',
      requirements: JSON.stringify({
        min_pronunciation_score: 80,
        session_count: 1
      }),
      xp_reward: 120,
      point_reward: 250,
      difficulty: 'hard'
    }
  ]);
  
  // Leaderboards 설정
  await knex('leaderboards').del();
  await knex('leaderboards').insert([
    {
      id: 1,
      leaderboard_type: 'weekly_xp',
      title: '주간 XP 랭킹',
      description: '이번 주 가장 많은 경험치를 획득한 학습자들',
      period_start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0],
      period_end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)).toISOString().split('T')[0],
      rewards: JSON.stringify({
        1: {xp: 500, points: 1000, badge: '🥇'},
        2: {xp: 300, points: 600, badge: '🥈'},
        3: {xp: 200, points: 400, badge: '🥉'}
      })
    },
    {
      id: 2,
      leaderboard_type: 'monthly_sessions',
      title: '월간 학습왕',
      description: '이번 달 가장 많은 세션을 완료한 학습자들',
      rewards: JSON.stringify({
        1: {points: 2000, badge: '👑'},
        2: {points: 1200, badge: '⭐'},
        3: {points: 800, badge: '🌟'}
      })
    },
    {
      id: 3,
      leaderboard_type: 'longest_streak',
      title: '연속 학습 챔피언',
      description: '가장 긴 연속 학습 기록을 가진 학습자들',
      rewards: JSON.stringify({
        1: {xp: 1000, points: 2500, badge: '🔥'},
        2: {xp: 600, points: 1500, badge: '🚀'},
        3: {xp: 400, points: 1000, badge: '💫'}
      })
    }
  ]);
  
  // 기존 사용자들에 대한 user_stats 생성
  const users = await knex('users').select('id');
  if (users.length > 0) {
    // 기존 user_stats 삭제 후 재생성
    await knex('user_stats').del();
    
    const userStatsData = users.map(user => ({
      user_id: user.id,
      current_level_id: 1, // 모든 사용자를 Beginner로 시작
      total_xp: 0,
      level_progress_xp: 0
    }));
    
    await knex('user_stats').insert(userStatsData);
  }
  
  console.log('✅ Gamification system seeded successfully');
  console.log('📊 Created:', {
    levels: 5,
    achievements: 11,
    dailyChallenges: 3,
    leaderboards: 3,
    userStats: users.length
  });
};