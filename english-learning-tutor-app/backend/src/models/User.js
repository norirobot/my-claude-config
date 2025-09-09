const { query, getDb } = require('../config/database-sqlite');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [id] = await query('users').insert({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'student',
        level: userData.level || 'beginner',
        points: 0,
        streak_days: 0,
        preferences: JSON.stringify(userData.preferences || {}),
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const user = await query('users')
        .where('id', id)
        .first();
      
      if (user) {
        delete user.password;
        if (user.preferences) {
          user.preferences = JSON.parse(user.preferences);
        }
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const user = await query('users')
        .where('email', email)
        .first();
      
      if (user && user.preferences) {
        user.preferences = JSON.parse(user.preferences);
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  /**
   * Find user by email with password (for authentication)
   */
  static async findByEmailWithPassword(email) {
    try {
      const user = await query('users')
        .where('email', email)
        .first();
      
      if (user && user.preferences) {
        user.preferences = JSON.parse(user.preferences);
      }
      
      return user; // Returns user with password for authentication
    } catch (error) {
      logger.error('Error finding user by email with password:', error);
      throw error;
    }
  }
  
  /**
   * Verify user password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Update user data
   */
  static async update(id, updateData) {
    try {
      // Remove password from update data if present
      delete updateData.password;
      
      // Handle preferences JSON
      if (updateData.preferences && typeof updateData.preferences === 'object') {
        updateData.preferences = JSON.stringify(updateData.preferences);
      }
      
      updateData.updated_at = new Date();
      
      await query('users')
        .where('id', id)
        .update(updateData);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Update user points
   */
  static async updatePoints(id, points) {
    try {
      await query('users')
        .where('id', id)
        .increment('points', points);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error updating user points:', error);
      throw error;
    }
  }
  
  /**
   * Update user streak
   */
  static async updateStreak(id) {
    try {
      const user = await this.findById(id);
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = user.last_activity_date ? 
        new Date(user.last_activity_date).toISOString().split('T')[0] : null;
      
      let newStreak = user.streak_days || 0;
      
      if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivity === yesterdayStr) {
          // Continue streak
          newStreak += 1;
        } else {
          // Reset streak
          newStreak = 1;
        }
        
        await query('users')
          .where('id', id)
          .update({
            streak_days: newStreak,
            last_activity_date: new Date(),
            updated_at: new Date()
          });
      }
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error updating user streak:', error);
      throw error;
    }
  }
  
  /**
   * Get user statistics
   */
  static async getStatistics(id) {
    try {
      const db = getDb();
      
      // Get total sessions
      const sessionsResult = await query('practice_sessions')
        .where('user_id', id)
        .count('id as count')
        .first();
      
      // Get total practice time
      const practiceTimeResult = await query('practice_sessions')
        .where('user_id', id)
        .sum('duration_seconds as total')
        .first();
      
      // Get average scores
      const scoresResult = await query('practice_sessions')
        .where('user_id', id)
        .where('status', 'completed')
        .avg({
          avg_pronunciation: 'pronunciation_score',
          avg_grammar: 'grammar_score',
          avg_fluency: 'fluency_score',
          avg_vocabulary: 'vocabulary_score'
        })
        .first();
      
      return {
        total_sessions: sessionsResult.count || 0,
        total_practice_minutes: Math.floor((practiceTimeResult.total || 0) / 60),
        average_scores: {
          pronunciation: Math.round(scoresResult.avg_pronunciation || 0),
          grammar: Math.round(scoresResult.avg_grammar || 0),
          fluency: Math.round(scoresResult.avg_fluency || 0),
          vocabulary: Math.round(scoresResult.avg_vocabulary || 0)
        }
      };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }
}

module.exports = User;