const { getDb } = require('../config/database-sqlite');

class UserLevel {
  static async findAll() {
    try {
      const db = getDb();
      const levels = await db('user_levels')
        .orderBy('level_order', 'asc');
      
      return levels.map(level => ({
        ...level,
        benefits: this.safeJSONParse(level.benefits, {})
      }));
    } catch (error) {
      throw new Error(`Error fetching user levels: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const db = getDb();
      const level = await db('user_levels')
        .where('id', id)
        .first();
      
      if (level) {
        level.benefits = this.safeJSONParse(level.benefits, {});
      }
      
      return level;
    } catch (error) {
      throw new Error(`Error finding user level: ${error.message}`);
    }
  }

  static async findByName(levelName) {
    try {
      const db = getDb();
      const level = await db('user_levels')
        .where('level_name', levelName)
        .first();
      
      if (level) {
        level.benefits = this.safeJSONParse(level.benefits, {});
      }
      
      return level;
    } catch (error) {
      throw new Error(`Error finding level by name: ${error.message}`);
    }
  }

  static async calculateLevelFromXP(totalXP) {
    try {
      const db = getDb();
      const level = await db('user_levels')
        .where('required_xp', '<=', totalXP)
        .orderBy('required_xp', 'desc')
        .first();
      
      if (level) {
        level.benefits = this.safeJSONParse(level.benefits, {});
        
        // Calculate progress to next level
        const nextLevel = await db('user_levels')
          .where('required_xp', '>', totalXP)
          .orderBy('required_xp', 'asc')
          .first();
        
        if (nextLevel) {
          const currentLevelXP = level.required_xp;
          const nextLevelXP = nextLevel.required_xp;
          const progressXP = totalXP - currentLevelXP;
          const neededXP = nextLevelXP - currentLevelXP;
          const progressPercentage = Math.round((progressXP / neededXP) * 100);
          
          return {
            current_level: level,
            next_level: nextLevel,
            progress_xp: progressXP,
            needed_xp: neededXP,
            progress_percentage: progressPercentage
          };
        } else {
          // Max level reached
          return {
            current_level: level,
            next_level: null,
            progress_xp: totalXP - level.required_xp,
            needed_xp: 0,
            progress_percentage: 100
          };
        }
      }
      
      // Default to first level if no level found
      return this.calculateLevelFromXP(0);
    } catch (error) {
      throw new Error(`Error calculating level from XP: ${error.message}`);
    }
  }

  static async getLevelBenefits(levelId) {
    try {
      const level = await this.findById(levelId);
      return level ? level.benefits : {};
    } catch (error) {
      throw new Error(`Error getting level benefits: ${error.message}`);
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

module.exports = UserLevel;