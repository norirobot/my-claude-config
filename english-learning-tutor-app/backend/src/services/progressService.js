// 사용자 진행률 추적 및 분석 서비스
const { v4: uuidv4 } = require('uuid');

// Mock 데이터베이스 (실제로는 PostgreSQL 사용)
const mockDB = {
  userProgress: new Map(),
  practiceHistory: new Map(),
  achievements: new Map(),
  streaks: new Map()
};

class ProgressService {
  // 사용자 진행률 업데이트
  async updateProgress(userId, sessionData) {
    try {
      const {
        situationId,
        score,
        messageCount,
        duration,
        completedAt = new Date(),
        feedback = {}
      } = sessionData;

      // 기존 진행률 데이터 가져오기 또는 초기화
      let userProgress = mockDB.userProgress.get(userId) || {
        userId,
        totalSessions: 0,
        totalPracticeMinutes: 0,
        averageScore: 0,
        situationStats: {},
        skillProgression: {
          pronunciation: 0,
          fluency: 0,
          vocabulary: 0,
          grammar: 0
        },
        streakInfo: {
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: null
        },
        levelInfo: {
          currentLevel: 1,
          experiencePoints: 0,
          pointsToNextLevel: 100
        },
        achievements: [],
        weeklyGoals: {
          sessionsTarget: 5,
          sessionsCompleted: 0,
          minutesTarget: 60,
          minutesCompleted: 0
        }
      };

      // 세션 통계 업데이트
      userProgress.totalSessions += 1;
      userProgress.totalPracticeMinutes += Math.round(duration / (1000 * 60)); // ms to minutes

      // 평균 점수 업데이트
      userProgress.averageScore = Math.round(
        ((userProgress.averageScore * (userProgress.totalSessions - 1)) + score) / userProgress.totalSessions
      );

      // 상황별 통계 업데이트
      if (!userProgress.situationStats[situationId]) {
        userProgress.situationStats[situationId] = {
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          totalTime: 0,
          lastAttempt: null,
          masteryLevel: 0
        };
      }

      const situationStat = userProgress.situationStats[situationId];
      situationStat.attempts += 1;
      situationStat.bestScore = Math.max(situationStat.bestScore, score);
      situationStat.averageScore = Math.round(
        ((situationStat.averageScore * (situationStat.attempts - 1)) + score) / situationStat.attempts
      );
      situationStat.totalTime += Math.round(duration / (1000 * 60));
      situationStat.lastAttempt = completedAt;

      // 숙련도 레벨 계산 (점수와 시도 횟수 기반)
      situationStat.masteryLevel = this.calculateMasteryLevel(situationStat);

      // 스킬 진행률 업데이트
      this.updateSkillProgression(userProgress, feedback, score);

      // 연속 학습일 업데이트
      this.updateStreak(userProgress, completedAt);

      // 경험치 및 레벨 업데이트
      this.updateExperienceAndLevel(userProgress, score, duration);

      // 주간 목표 업데이트
      this.updateWeeklyGoals(userProgress, duration);

      // 업적 확인 및 추가
      const newAchievements = await this.checkAchievements(userId, userProgress, sessionData);

      // 진행률 데이터 저장
      mockDB.userProgress.set(userId, userProgress);

      // 연습 기록 저장
      this.savePracticeRecord(userId, sessionData);

      return {
        success: true,
        progress: userProgress,
        newAchievements,
        levelUp: newAchievements.some(a => a.type === 'level_up')
      };

    } catch (error) {
      console.error('Progress update error:', error);
      throw error;
    }
  }

  // 숙련도 레벨 계산
  calculateMasteryLevel(situationStat) {
    const { attempts, averageScore, bestScore } = situationStat;
    
    // 기본 공식: (평균점수 * 0.6 + 최고점수 * 0.4) * 시도횟수 보정
    const scoreComponent = (averageScore * 0.6 + bestScore * 0.4) / 100;
    const attemptComponent = Math.min(attempts / 10, 1); // 10회 시도시 최대값
    
    return Math.round((scoreComponent * attemptComponent) * 100);
  }

  // 스킬별 진행률 업데이트
  updateSkillProgression(userProgress, feedback, score) {
    const skills = userProgress.skillProgression;
    
    // 피드백 기반 스킬 업데이트
    if (feedback.pronunciationScore) {
      skills.pronunciation = Math.round((skills.pronunciation * 0.8) + (feedback.pronunciationScore * 0.2));
    }
    if (feedback.grammarScore) {
      skills.grammar = Math.round((skills.grammar * 0.8) + (feedback.grammarScore * 0.2));
    }
    if (feedback.fluencyScore) {
      skills.fluency = Math.round((skills.fluency * 0.8) + (feedback.fluencyScore * 0.2));
    }
    
    // 전체 점수 기반 어휘 업데이트
    skills.vocabulary = Math.round((skills.vocabulary * 0.9) + (score * 0.1));

    // 모든 스킬을 0-100 범위로 제한
    Object.keys(skills).forEach(skill => {
      skills[skill] = Math.max(0, Math.min(100, skills[skill]));
    });
  }

  // 연속 학습일 업데이트
  updateStreak(userProgress, completedAt) {
    const streakInfo = userProgress.streakInfo;
    const today = new Date(completedAt).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const lastPracticeDate = streakInfo.lastPracticeDate ? 
      new Date(streakInfo.lastPracticeDate).toDateString() : null;

    if (!lastPracticeDate || lastPracticeDate === yesterday) {
      // 연속 학습
      streakInfo.currentStreak += 1;
      streakInfo.longestStreak = Math.max(streakInfo.longestStreak, streakInfo.currentStreak);
    } else if (lastPracticeDate !== today) {
      // 연속성 끊어짐
      streakInfo.currentStreak = 1;
    }
    // 오늘 이미 연습한 경우는 변경 없음

    streakInfo.lastPracticeDate = completedAt;
  }

  // 경험치 및 레벨 업데이트
  updateExperienceAndLevel(userProgress, score, duration) {
    const levelInfo = userProgress.levelInfo;
    
    // 경험치 계산 (점수 + 시간 보너스)
    const baseXP = Math.round(score / 10); // 점수의 10%
    const timeBonus = Math.round(duration / (1000 * 60 * 2)); // 2분당 1XP
    const earnedXP = baseXP + timeBonus;

    levelInfo.experiencePoints += earnedXP;

    // 레벨업 확인
    while (levelInfo.experiencePoints >= levelInfo.pointsToNextLevel) {
      levelInfo.experiencePoints -= levelInfo.pointsToNextLevel;
      levelInfo.currentLevel += 1;
      levelInfo.pointsToNextLevel = this.calculateNextLevelPoints(levelInfo.currentLevel);
    }
  }

  // 다음 레벨 필요 포인트 계산
  calculateNextLevelPoints(currentLevel) {
    return Math.round(100 * Math.pow(1.1, currentLevel - 1));
  }

  // 주간 목표 업데이트
  updateWeeklyGoals(userProgress, duration) {
    const goals = userProgress.weeklyGoals;
    goals.sessionsCompleted += 1;
    goals.minutesCompleted += Math.round(duration / (1000 * 60));

    // 주간 리셋 로직 (실제로는 cron job으로 구현)
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // 간단한 주간 리셋 체크 (실제로는 더 정교하게 구현 필요)
    if (!userProgress.lastWeekReset || 
        new Date(userProgress.lastWeekReset) < weekStart) {
      goals.sessionsCompleted = 1;
      goals.minutesCompleted = Math.round(duration / (1000 * 60));
      userProgress.lastWeekReset = new Date();
    }
  }

  // 연습 기록 저장
  savePracticeRecord(userId, sessionData) {
    const recordId = uuidv4();
    const record = {
      id: recordId,
      userId,
      ...sessionData,
      createdAt: new Date()
    };

    if (!mockDB.practiceHistory.has(userId)) {
      mockDB.practiceHistory.set(userId, []);
    }

    mockDB.practiceHistory.get(userId).push(record);

    // 최근 50개 기록만 유지
    const userHistory = mockDB.practiceHistory.get(userId);
    if (userHistory.length > 50) {
      mockDB.practiceHistory.set(userId, userHistory.slice(-50));
    }
  }

  // 업적 확인
  async checkAchievements(userId, userProgress, sessionData) {
    const newAchievements = [];
    const userAchievements = userProgress.achievements || [];

    // 업적 정의
    const achievements = [
      {
        id: 'first_session',
        name: '첫 걸음',
        description: '첫 번째 연습 세션 완료',
        condition: () => userProgress.totalSessions === 1,
        type: 'milestone',
        points: 50
      },
      {
        id: 'perfect_score',
        name: '완벽한 점수',
        description: '100점 달성',
        condition: () => sessionData.score === 100,
        type: 'achievement',
        points: 100
      },
      {
        id: 'streak_7',
        name: '일주일 연속',
        description: '7일 연속 학습',
        condition: () => userProgress.streakInfo.currentStreak === 7,
        type: 'streak',
        points: 150
      },
      {
        id: 'level_5',
        name: '레벨 5 달성',
        description: '레벨 5에 도달',
        condition: () => userProgress.levelInfo.currentLevel === 5,
        type: 'level_up',
        points: 200
      },
      {
        id: 'daegu_master',
        name: '대구 마스터',
        description: '대구 특화 상황 모두 마스터',
        condition: () => this.checkDaeguMastery(userProgress),
        type: 'mastery',
        points: 300
      },
      {
        id: 'session_50',
        name: '열정적인 학습자',
        description: '50회 연습 완료',
        condition: () => userProgress.totalSessions === 50,
        type: 'milestone',
        points: 250
      }
    ];

    // 새로운 업적 확인
    for (const achievement of achievements) {
      if (!userAchievements.includes(achievement.id) && achievement.condition()) {
        newAchievements.push({
          ...achievement,
          earnedAt: new Date()
        });
        userAchievements.push(achievement.id);
        
        // 업적 포인트 추가
        userProgress.levelInfo.experiencePoints += achievement.points;
      }
    }

    userProgress.achievements = userAchievements;
    return newAchievements;
  }

  // 대구 마스터 조건 확인
  checkDaeguMastery(userProgress) {
    const daeguSituations = ['daegu_taxi', 'daegu_food', 'daegu_shopping'];
    return daeguSituations.every(situationId => {
      const stat = userProgress.situationStats[situationId];
      return stat && stat.masteryLevel >= 80; // 80% 이상 숙련도
    });
  }

  // 사용자 진행률 조회
  async getUserProgress(userId) {
    const progress = mockDB.userProgress.get(userId);
    if (!progress) {
      return this.initializeUserProgress(userId);
    }

    // 추가 통계 계산
    return {
      ...progress,
      statistics: this.calculateStatistics(progress),
      recommendations: this.generateRecommendations(progress)
    };
  }

  // 초기 진행률 데이터 생성
  initializeUserProgress(userId) {
    const initialProgress = {
      userId,
      totalSessions: 0,
      totalPracticeMinutes: 0,
      averageScore: 0,
      situationStats: {},
      skillProgression: {
        pronunciation: 0,
        fluency: 0,
        vocabulary: 0,
        grammar: 0
      },
      streakInfo: {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null
      },
      levelInfo: {
        currentLevel: 1,
        experiencePoints: 0,
        pointsToNextLevel: 100
      },
      achievements: [],
      weeklyGoals: {
        sessionsTarget: 5,
        sessionsCompleted: 0,
        minutesTarget: 60,
        minutesCompleted: 0
      },
      statistics: {},
      recommendations: []
    };

    mockDB.userProgress.set(userId, initialProgress);
    return initialProgress;
  }

  // 통계 계산
  calculateStatistics(progress) {
    return {
      practiceTime: {
        total: progress.totalPracticeMinutes,
        average: Math.round(progress.totalPracticeMinutes / Math.max(progress.totalSessions, 1)),
        thisWeek: progress.weeklyGoals.minutesCompleted
      },
      performance: {
        averageScore: progress.averageScore,
        bestScore: Math.max(...Object.values(progress.situationStats).map(s => s.bestScore), 0),
        improvement: this.calculateImprovement(progress)
      },
      engagement: {
        currentStreak: progress.streakInfo.currentStreak,
        longestStreak: progress.streakInfo.longestStreak,
        consistencyScore: this.calculateConsistency(progress)
      }
    };
  }

  // 개선도 계산
  calculateImprovement(progress) {
    // 최근 5회와 첫 5회 세션 점수 비교
    const history = mockDB.practiceHistory.get(progress.userId) || [];
    if (history.length < 5) return 0;

    const recentScores = history.slice(-5).map(h => h.score);
    const earliestScores = history.slice(0, 5).map(h => h.score);

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const earliestAvg = earliestScores.reduce((a, b) => a + b, 0) / earliestScores.length;

    return Math.round(recentAvg - earliestAvg);
  }

  // 일관성 점수 계산
  calculateConsistency(progress) {
    const streak = progress.streakInfo.currentStreak;
    const total = progress.totalSessions;
    
    return Math.min(100, Math.round((streak / Math.max(total, 1)) * 100));
  }

  // 맞춤형 추천 생성
  generateRecommendations(progress) {
    const recommendations = [];

    // 약한 스킬 개선 추천
    const skills = progress.skillProgression;
    const weakestSkill = Object.keys(skills).reduce((a, b) => skills[a] < skills[b] ? a : b);
    
    if (skills[weakestSkill] < 70) {
      recommendations.push({
        type: 'skill_improvement',
        priority: 'high',
        title: `${this.getSkillName(weakestSkill)} 집중 연습`,
        description: `${this.getSkillName(weakestSkill)} 실력 향상을 위한 맞춤 연습을 추천합니다.`,
        action: `focus_${weakestSkill}`
      });
    }

    // 새로운 상황 추천
    const masteredSituations = Object.keys(progress.situationStats)
      .filter(id => progress.situationStats[id].masteryLevel >= 80);
    
    if (masteredSituations.length >= 3) {
      recommendations.push({
        type: 'new_challenge',
        priority: 'medium',
        title: '새로운 상황에 도전',
        description: '더 어려운 상황으로 실력을 한 단계 업그레이드하세요.',
        action: 'explore_advanced'
      });
    }

    // 연속 학습 독려
    if (progress.streakInfo.currentStreak === 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'low',
        title: '꾸준한 학습 시작',
        description: '매일 조금씩이라도 연습하면 큰 효과를 볼 수 있습니다.',
        action: 'start_streak'
      });
    }

    return recommendations;
  }

  // 스킬 이름 매핑
  getSkillName(skillKey) {
    const skillNames = {
      pronunciation: '발음',
      fluency: '유창성',
      vocabulary: '어휘',
      grammar: '문법'
    };
    return skillNames[skillKey] || skillKey;
  }
}

// 싱글톤 인스턴스
const progressService = new ProgressService();

module.exports = progressService;