const { getDb } = require('../config/database-sqlite');

class TutorEarnings {
  static async findByTutorId(tutorId) {
    try {
      const db = getDb();
      const earnings = await db('tutor_earnings')
        .where('tutor_id', tutorId)
        .first();
      
      return earnings;
    } catch (error) {
      throw new Error(`Error finding tutor earnings: ${error.message}`);
    }
  }

  static async createEarningsAccount(tutorId) {
    try {
      const db = getDb();
      
      // 이미 계정이 있는지 확인
      const existing = await this.findByTutorId(tutorId);
      if (existing) {
        return existing;
      }

      const [earningsId] = await db('tutor_earnings').insert({
        tutor_id: tutorId,
        total_earned: 0,
        available_balance: 0,
        pending_balance: 0,
        withdrawn_total: 0,
        total_sessions: 0,
        average_rating: 0
      });

      return await db('tutor_earnings').where('id', earningsId).first();
    } catch (error) {
      throw new Error(`Error creating earnings account: ${error.message}`);
    }
  }

  static async updateEarnings(tutorId, sessionEarning, sessionCompleted = false) {
    const db = getDb();
    
    try {
      return await db.transaction(async (trx) => {
        // 현재 수익 계정 조회
        const earnings = await trx('tutor_earnings')
          .where('tutor_id', tutorId)
          .first()
          .forUpdate();

        if (!earnings) {
          throw new Error('Tutor earnings account not found');
        }

        const updateData = {
          total_earned: parseFloat(earnings.total_earned) + parseFloat(sessionEarning),
          total_sessions: parseInt(earnings.total_sessions) + 1,
          updated_at: new Date()
        };

        // 세션이 완료되면 available_balance에 추가, 아니면 pending_balance에 추가
        if (sessionCompleted) {
          updateData.available_balance = parseFloat(earnings.available_balance) + parseFloat(sessionEarning);
        } else {
          updateData.pending_balance = parseFloat(earnings.pending_balance) + parseFloat(sessionEarning);
        }

        await trx('tutor_earnings')
          .where('tutor_id', tutorId)
          .update(updateData);

        return await trx('tutor_earnings').where('tutor_id', tutorId).first();
      });
    } catch (error) {
      throw new Error(`Error updating earnings: ${error.message}`);
    }
  }

  static async movePendingToAvailable(tutorId, amount) {
    const db = getDb();
    
    try {
      return await db.transaction(async (trx) => {
        const earnings = await trx('tutor_earnings')
          .where('tutor_id', tutorId)
          .first()
          .forUpdate();

        if (!earnings) {
          throw new Error('Tutor earnings account not found');
        }

        const pendingBalance = parseFloat(earnings.pending_balance);
        if (pendingBalance < amount) {
          throw new Error('Insufficient pending balance');
        }

        await trx('tutor_earnings')
          .where('tutor_id', tutorId)
          .update({
            pending_balance: pendingBalance - amount,
            available_balance: parseFloat(earnings.available_balance) + amount,
            updated_at: new Date()
          });

        return await trx('tutor_earnings').where('tutor_id', tutorId).first();
      });
    } catch (error) {
      throw new Error(`Error moving pending to available: ${error.message}`);
    }
  }

  static async processPayout(tutorId, amount) {
    const db = getDb();
    
    try {
      return await db.transaction(async (trx) => {
        const earnings = await trx('tutor_earnings')
          .where('tutor_id', tutorId)
          .first()
          .forUpdate();

        if (!earnings) {
          throw new Error('Tutor earnings account not found');
        }

        const availableBalance = parseFloat(earnings.available_balance);
        if (availableBalance < amount) {
          throw new Error('Insufficient available balance');
        }

        await trx('tutor_earnings')
          .where('tutor_id', tutorId)
          .update({
            available_balance: availableBalance - amount,
            withdrawn_total: parseFloat(earnings.withdrawn_total) + amount,
            last_payout: new Date(),
            updated_at: new Date()
          });

        return await trx('tutor_earnings').where('tutor_id', tutorId).first();
      });
    } catch (error) {
      throw new Error(`Error processing payout: ${error.message}`);
    }
  }

  static async updateRating(tutorId, newRating) {
    try {
      const db = getDb();
      
      // 현재 평균 평점과 세션 수를 가져와서 새로운 평균 계산
      const earnings = await this.findByTutorId(tutorId);
      if (!earnings) {
        throw new Error('Tutor earnings account not found');
      }

      const currentRating = parseFloat(earnings.average_rating) || 0;
      const totalSessions = parseInt(earnings.total_sessions) || 0;
      
      // 새로운 평균 평점 계산
      const newAverageRating = totalSessions === 0 
        ? newRating 
        : ((currentRating * (totalSessions - 1)) + newRating) / totalSessions;

      await db('tutor_earnings')
        .where('tutor_id', tutorId)
        .update({
          average_rating: newAverageRating.toFixed(2),
          updated_at: new Date()
        });

      return await this.findByTutorId(tutorId);
    } catch (error) {
      throw new Error(`Error updating rating: ${error.message}`);
    }
  }

  static async getTutorStats(tutorId, period = '30days') {
    try {
      const db = getDb();
      
      let dateFilter;
      const now = new Date();
      
      switch (period) {
        case '7days':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const sessionStats = await db('session_earnings')
        .where('tutor_id', tutorId)
        .where('session_date', '>=', dateFilter)
        .where('status', 'completed')
        .select(
          db.raw('COUNT(*) as sessions_count'),
          db.raw('SUM(tutor_earning) as period_earnings'),
          db.raw('AVG(tutor_earning) as avg_session_earning'),
          db.raw('SUM(session_price) as total_revenue')
        )
        .first();

      const earnings = await this.findByTutorId(tutorId);

      return {
        period: period,
        sessions_in_period: parseInt(sessionStats.sessions_count) || 0,
        earnings_in_period: parseFloat(sessionStats.period_earnings) || 0,
        avg_session_earning: parseFloat(sessionStats.avg_session_earning) || 0,
        total_revenue_in_period: parseFloat(sessionStats.total_revenue) || 0,
        total_earned: parseFloat(earnings?.total_earned) || 0,
        available_balance: parseFloat(earnings?.available_balance) || 0,
        pending_balance: parseFloat(earnings?.pending_balance) || 0,
        total_sessions: parseInt(earnings?.total_sessions) || 0,
        average_rating: parseFloat(earnings?.average_rating) || 0
      };
    } catch (error) {
      throw new Error(`Error getting tutor stats: ${error.message}`);
    }
  }

  static async getAllTutorEarnings(filters = {}) {
    try {
      const db = getDb();
      const { page = 1, limit = 20, minEarnings, orderBy = 'total_earned' } = filters;
      const offset = (page - 1) * limit;

      let query = db('tutor_earnings')
        .select(
          'tutor_earnings.*',
          'tutors.specialty',
          'users.name',
          'users.email'
        )
        .leftJoin('tutors', 'tutor_earnings.tutor_id', 'tutors.id')
        .leftJoin('users', 'tutors.user_id', 'users.id')
        .orderBy(`tutor_earnings.${orderBy}`, 'desc');

      if (minEarnings) {
        query = query.where('tutor_earnings.total_earned', '>=', minEarnings);
      }

      const earnings = await query.limit(limit).offset(offset);
      
      return earnings;
    } catch (error) {
      throw new Error(`Error getting all tutor earnings: ${error.message}`);
    }
  }
}

module.exports = TutorEarnings;