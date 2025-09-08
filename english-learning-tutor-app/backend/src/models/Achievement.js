const { getDb } = require('../config/database-sqlite');

class Achievement {
  static async findAll(filters = {}) {
    try {
      const db = getDb();
      let query = db('achievements').where('is_active', true);
      
      if (filters.category) {
        query = query.where('category', filters.category);
      }
      
      const achievements = await query.orderBy('category', 'asc');
      
      return achievements.map(achievement => ({
        ...achievement,
        requirements: this.safeJSONParse(achievement.requirements, {})
      }));
    } catch (error) {
      throw new Error(`Error fetching achievements: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const db = getDb();
      const achievement = await db('achievements')
        .where('id', id)
        .first();
      
      if (achievement) {
        achievement.requirements = this.safeJSONParse(achievement.requirements, {});
      }
      
      return achievement;
    } catch (error) {
      throw new Error(`Error finding achievement: ${error.message}`);
    }
  }

  static async findByKey(achievementKey) {
    try {
      const db = getDb();
      const achievement = await db('achievements')
        .where('achievement_key', achievementKey)
        .first();
      
      if (achievement) {
        achievement.requirements = this.safeJSONParse(achievement.requirements, {});
      }
      
      return achievement;
    } catch (error) {
      throw new Error(`Error finding achievement by key: ${error.message}`);
    }
  }

  static async getUserAchievements(userId, category = null) {
    try {
      const db = getDb();
      let query = db('user_achievements')
        .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
        .select(
          'achievements.*',
          'user_achievements.unlocked_at',
          'user_achievements.progress_data',
          'user_achievements.is_notified'
        )
        .where('user_achievements.user_id', userId);
      
      if (category) {
        query = query.where('achievements.category', category);
      }
      
      const achievements = await query.orderBy('user_achievements.unlocked_at', 'desc');
      
      return achievements.map(achievement => ({
        ...achievement,
        requirements: this.safeJSONParse(achievement.requirements, {}),
        progress_data: this.safeJSONParse(achievement.progress_data, {})
      }));
    } catch (error) {
      throw new Error(`Error getting user achievements: ${error.message}`);
    }
  }

  static async checkAndUnlockAchievements(userId, eventType, eventData) {
    try {
      const db = getDb();
      const newAchievements = [];
      
      // Get all achievements that aren't unlocked yet
      const availableAchievements = await db('achievements')
        .whereNotIn('id', function() {
          this.select('achievement_id')
            .from('user_achievements')
            .where('user_id', userId);
        })
        .where('is_active', true);
      
      // Get user stats for checking requirements
      const userStats = await db('user_stats').where('user_id', userId).first();
      if (!userStats) {
        throw new Error('User stats not found');
      }
      
      for (const achievement of availableAchievements) {
        const requirements = this.safeJSONParse(achievement.requirements, {});
        
        if (this.checkAchievementRequirement(requirements, eventType, eventData, userStats)) {
          // Unlock the achievement
          await db('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked_at: new Date(),
            progress_data: JSON.stringify(eventData),
            is_notified: false
          });
          
          // Update user XP and points
          await this.rewardUser(userId, achievement.xp_reward, achievement.point_reward);
          
          newAchievements.push({
            ...achievement,
            requirements
          });
        }
      }
      
      return newAchievements;
    } catch (error) {
      throw new Error(`Error checking achievements: ${error.message}`);
    }
  }

  static checkAchievementRequirement(requirements, eventType, eventData, userStats) {
    switch (requirements.type) {
      case 'session_count':
        return userStats.total_sessions >= requirements.count;
      
      case 'streak_days':
        return userStats.current_streak >= requirements.count;
      
      case 'avg_score':
        const scoreField = `avg_${requirements.score_type}_score`;
        return userStats[scoreField] >= requirements.threshold;
      
      case 'tutor_session_count':
        return userStats.tutor_sessions >= requirements.count;
      
      case 'daily_challenges':
        // This would need additional logic based on completed challenges
        return false; // Placeholder
      
      case 'practice_minutes':
        return userStats.total_practice_minutes >= requirements.count;
      
      case 'unique_tutors':
        // This would need additional query to count unique tutors
        return false; // Placeholder
      
      default:
        return false;
    }
  }

  static async rewardUser(userId, xpReward, pointReward) {
    try {
      const db = getDb();
      
      // Update user stats with XP
      if (xpReward > 0) {
        await db('user_stats')
          .where('user_id', userId)
          .increment('total_xp', xpReward);
      }
      
      // Update user points if point reward exists
      if (pointReward > 0) {
        // Update user wallet
        const UserWallet = require('./UserWallet');
        await UserWallet.updateBalance(
          userId, 
          pointReward, 
          `Achievement reward: ${pointReward} points`
        );
        
        // Update total points earned in stats
        await db('user_stats')
          .where('user_id', userId)
          .increment('total_points_earned', pointReward);
      }
      
      // Check for level up
      const userStats = await db('user_stats').where('user_id', userId).first();
      if (userStats) {
        const UserLevel = require('./UserLevel');
        const levelInfo = await UserLevel.calculateLevelFromXP(userStats.total_xp);
        
        // Update current level if changed
        if (levelInfo.current_level.id !== userStats.current_level_id) {
          await db('user_stats')
            .where('user_id', userId)
            .update({
              current_level_id: levelInfo.current_level.id,
              level_progress_xp: levelInfo.progress_xp
            });
        } else {
          // Update level progress
          await db('user_stats')
            .where('user_id', userId)
            .update({
              level_progress_xp: levelInfo.progress_xp
            });
        }
      }
    } catch (error) {
      throw new Error(`Error rewarding user: ${error.message}`);
    }
  }

  static async getAchievementProgress(userId, achievementId) {
    try {
      const db = getDb();
      const achievement = await this.findById(achievementId);
      const userStats = await db('user_stats').where('user_id', userId).first();
      
      if (!achievement || !userStats) {
        return null;
      }
      
      const requirements = achievement.requirements;
      let currentProgress = 0;
      let maxProgress = 0;
      
      switch (requirements.type) {
        case 'session_count':
          currentProgress = Math.min(userStats.total_sessions, requirements.count);
          maxProgress = requirements.count;
          break;
        
        case 'streak_days':
          currentProgress = Math.min(userStats.current_streak, requirements.count);
          maxProgress = requirements.count;
          break;
        
        case 'practice_minutes':
          currentProgress = Math.min(userStats.total_practice_minutes, requirements.count);
          maxProgress = requirements.count;
          break;
        
        case 'avg_score':
          const scoreField = `avg_${requirements.score_type}_score`;
          currentProgress = Math.min(userStats[scoreField], requirements.threshold);
          maxProgress = requirements.threshold;
          break;
        
        default:
          currentProgress = 0;
          maxProgress = 1;
      }
      
      const progressPercentage = maxProgress > 0 ? Math.round((currentProgress / maxProgress) * 100) : 0;
      
      return {
        achievement,
        current_progress: currentProgress,
        max_progress: maxProgress,
        progress_percentage: Math.min(progressPercentage, 100),
        is_completed: progressPercentage >= 100
      };
    } catch (error) {
      throw new Error(`Error getting achievement progress: ${error.message}`);
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

module.exports = Achievement;