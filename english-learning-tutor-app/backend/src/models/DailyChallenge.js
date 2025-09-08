const { getDb } = require('../config/database-sqlite');

class DailyChallenge {
  static async getTodaysChallenges() {
    try {
      const db = getDb();
      const today = new Date().toISOString().split('T')[0];
      
      const challenges = await db('daily_challenges')
        .where('challenge_date', today)
        .where('is_active', true)
        .orderBy('difficulty', 'asc');
      
      return challenges.map(challenge => ({
        ...challenge,
        requirements: this.safeJSONParse(challenge.requirements, {})
      }));
    } catch (error) {
      throw new Error(`Error fetching today's challenges: ${error.message}`);
    }
  }

  static async getUserChallengeProgress(userId, challengeDate = null) {
    try {
      const db = getDb();
      const targetDate = challengeDate || new Date().toISOString().split('T')[0];
      
      const userChallenges = await db('user_daily_challenges')
        .join('daily_challenges', 'user_daily_challenges.challenge_id', 'daily_challenges.id')
        .select(
          'daily_challenges.*',
          'user_daily_challenges.progress_data',
          'user_daily_challenges.is_completed',
          'user_daily_challenges.completed_at',
          'user_daily_challenges.reward_claimed',
          'user_daily_challenges.reward_claimed_at'
        )
        .where('user_daily_challenges.user_id', userId)
        .where('daily_challenges.challenge_date', targetDate);
      
      return userChallenges.map(challenge => ({
        ...challenge,
        requirements: this.safeJSONParse(challenge.requirements, {}),
        progress_data: this.safeJSONParse(challenge.progress_data, {})
      }));
    } catch (error) {
      throw new Error(`Error getting user challenge progress: ${error.message}`);
    }
  }

  static async initializeUserChallenges(userId) {
    try {
      const db = getDb();
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's challenges
      const todaysChallenges = await this.getTodaysChallenges();
      
      // Check which challenges user hasn't been assigned yet
      const existingChallenges = await db('user_daily_challenges')
        .join('daily_challenges', 'user_daily_challenges.challenge_id', 'daily_challenges.id')
        .where('user_daily_challenges.user_id', userId)
        .where('daily_challenges.challenge_date', today)
        .pluck('daily_challenges.id');
      
      // Initialize new challenges for user
      const newChallenges = todaysChallenges.filter(
        challenge => !existingChallenges.includes(challenge.id)
      );
      
      for (const challenge of newChallenges) {
        await db('user_daily_challenges').insert({
          user_id: userId,
          challenge_id: challenge.id,
          progress_data: JSON.stringify(this.getInitialProgress(challenge)),
          is_completed: false,
          reward_claimed: false
        });
      }
      
      return await this.getUserChallengeProgress(userId);
    } catch (error) {
      throw new Error(`Error initializing user challenges: ${error.message}`);
    }
  }

  static async updateChallengeProgress(userId, eventType, eventData) {
    try {
      const db = getDb();
      const today = new Date().toISOString().split('T')[0];
      
      // Get user's active challenges for today
      const userChallenges = await this.getUserChallengeProgress(userId);
      const completedChallenges = [];
      
      for (const challenge of userChallenges) {
        if (challenge.is_completed) continue;
        
        const updatedProgress = this.calculateProgress(
          challenge, 
          eventType, 
          eventData, 
          challenge.progress_data
        );
        
        const isCompleted = this.checkCompletion(challenge.requirements, updatedProgress);
        
        // Update progress in database
        await db('user_daily_challenges')
          .where('user_id', userId)
          .where('challenge_id', challenge.id)
          .update({
            progress_data: JSON.stringify(updatedProgress),
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date() : null,
            updated_at: new Date()
          });
        
        if (isCompleted && !challenge.is_completed) {
          completedChallenges.push({
            ...challenge,
            progress_data: updatedProgress
          });
        }
      }
      
      return completedChallenges;
    } catch (error) {
      throw new Error(`Error updating challenge progress: ${error.message}`);
    }
  }

  static calculateProgress(challenge, eventType, eventData, currentProgress) {
    const newProgress = { ...currentProgress };
    
    switch (challenge.challenge_type) {
      case 'session_count':
        if (eventType === 'session_completed') {
          newProgress.completed_sessions = (newProgress.completed_sessions || 0) + 1;
        }
        break;
      
      case 'practice_time':
        if (eventType === 'session_completed' && eventData.duration_seconds) {
          newProgress.total_minutes = (newProgress.total_minutes || 0) + 
            Math.floor(eventData.duration_seconds / 60);
        }
        break;
      
      case 'pronunciation_focus':
        if (eventType === 'session_completed' && eventData.pronunciation_score) {
          if (eventData.pronunciation_score >= challenge.requirements.min_pronunciation_score) {
            newProgress.qualifying_sessions = (newProgress.qualifying_sessions || 0) + 1;
          }
        }
        break;
      
      case 'streak_maintain':
        if (eventType === 'daily_activity') {
          newProgress.streak_maintained = true;
        }
        break;
      
      case 'vocabulary_learn':
        if (eventType === 'vocabulary_learned') {
          newProgress.words_learned = (newProgress.words_learned || 0) + (eventData.word_count || 1);
        }
        break;
      
      default:
        // Custom challenge types can be added here
        break;
    }
    
    return newProgress;
  }

  static checkCompletion(requirements, progress) {
    switch (requirements.session_count) {
      case requirements.session_count !== undefined:
        return (progress.completed_sessions || 0) >= requirements.session_count;
      
      case requirements.total_practice_minutes !== undefined:
        return (progress.total_minutes || 0) >= requirements.total_practice_minutes;
      
      case requirements.min_pronunciation_score !== undefined:
        return (progress.qualifying_sessions || 0) >= (requirements.session_count || 1);
      
      case requirements.maintain_streak !== undefined:
        return progress.streak_maintained === true;
      
      case requirements.words_to_learn !== undefined:
        return (progress.words_learned || 0) >= requirements.words_to_learn;
      
      default:
        return false;
    }
  }

  static getInitialProgress(challenge) {
    switch (challenge.challenge_type) {
      case 'session_count':
        return { completed_sessions: 0 };
      
      case 'practice_time':
        return { total_minutes: 0 };
      
      case 'pronunciation_focus':
        return { qualifying_sessions: 0 };
      
      case 'streak_maintain':
        return { streak_maintained: false };
      
      case 'vocabulary_learn':
        return { words_learned: 0 };
      
      default:
        return {};
    }
  }

  static async claimReward(userId, challengeId) {
    try {
      const db = getDb();
      
      // Check if challenge is completed and reward not claimed
      const userChallenge = await db('user_daily_challenges')
        .join('daily_challenges', 'user_daily_challenges.challenge_id', 'daily_challenges.id')
        .select('daily_challenges.*', 'user_daily_challenges.*')
        .where('user_daily_challenges.user_id', userId)
        .where('user_daily_challenges.challenge_id', challengeId)
        .first();
      
      if (!userChallenge || !userChallenge.is_completed || userChallenge.reward_claimed) {
        throw new Error('Challenge not eligible for reward claim');
      }
      
      // Award XP and points
      const Achievement = require('./Achievement');
      await Achievement.rewardUser(userId, userChallenge.xp_reward, userChallenge.point_reward);
      
      // Mark reward as claimed
      await db('user_daily_challenges')
        .where('user_id', userId)
        .where('challenge_id', challengeId)
        .update({
          reward_claimed: true,
          reward_claimed_at: new Date()
        });
      
      return {
        xp_reward: userChallenge.xp_reward,
        point_reward: userChallenge.point_reward,
        challenge_title: userChallenge.title
      };
    } catch (error) {
      throw new Error(`Error claiming challenge reward: ${error.message}`);
    }
  }

  static async generateDailyChallenges(date) {
    try {
      const db = getDb();
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Check if challenges already exist for this date
      const existingChallenges = await db('daily_challenges')
        .where('challenge_date', targetDate)
        .count('id as count')
        .first();
      
      if (existingChallenges.count > 0) {
        return await db('daily_challenges')
          .where('challenge_date', targetDate)
          .where('is_active', true);
      }
      
      // Generate new challenges for the date
      const challengeTemplates = [
        {
          challenge_type: 'session_count',
          title: '데일리 세션',
          description: '오늘 2개의 학습 세션을 완료하세요',
          requirements: { session_count: 2, min_duration_seconds: 300 },
          xp_reward: 80,
          point_reward: 150,
          difficulty: 'easy'
        },
        {
          challenge_type: 'practice_time',
          title: '집중 학습',
          description: '총 15분 이상 학습하세요',
          requirements: { total_practice_minutes: 15 },
          xp_reward: 100,
          point_reward: 200,
          difficulty: 'normal'
        },
        {
          challenge_type: 'pronunciation_focus',
          title: '발음 도전',
          description: '발음 점수 75점 이상으로 세션을 완료하세요',
          requirements: { min_pronunciation_score: 75, session_count: 1 },
          xp_reward: 120,
          point_reward: 250,
          difficulty: 'hard'
        }
      ];
      
      const newChallenges = [];
      for (const template of challengeTemplates) {
        const [challengeId] = await db('daily_challenges').insert({
          challenge_date: targetDate,
          challenge_type: template.challenge_type,
          title: template.title,
          description: template.description,
          requirements: JSON.stringify(template.requirements),
          xp_reward: template.xp_reward,
          point_reward: template.point_reward,
          difficulty: template.difficulty,
          is_active: true
        });
        
        newChallenges.push({ id: challengeId, ...template });
      }
      
      return newChallenges;
    } catch (error) {
      throw new Error(`Error generating daily challenges: ${error.message}`);
    }
  }

  static safeJSONParse(str, defaultValue = {}) {
    try {
      return typeof str === 'string' ? JSON.parse(str) : (str || defaultValue);
    } catch (error) {
      return defaultValue;
    }
  }
}

module.exports = DailyChallenge;