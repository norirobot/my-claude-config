const { getDb } = require('../config/database-sqlite');

class SessionEarnings {
  static async create(sessionData) {
    try {
      const db = getDb();
      
      const earningsId = `EARN_${Date.now()}_${sessionData.tutor_id}`;
      const fullSessionData = {
        earnings_id: earningsId,
        ...sessionData,
        status: sessionData.status || 'pending'
      };

      await db('session_earnings').insert(fullSessionData);
      return await this.findById(earningsId);
    } catch (error) {
      throw new Error(`Error creating session earnings: ${error.message}`);
    }
  }

  static async findById(earningsId) {
    try {
      const db = getDb();
      const earnings = await db('session_earnings')
        .where('earnings_id', earningsId)
        .first();
      
      return earnings;
    } catch (error) {
      throw new Error(`Error finding session earnings: ${error.message}`);
    }
  }

  static async findByBookingId(bookingId) {
    try {
      const db = getDb();
      const earnings = await db('session_earnings')
        .where('booking_id', bookingId)
        .first();
      
      return earnings;
    } catch (error) {
      throw new Error(`Error finding session earnings by booking: ${error.message}`);
    }
  }

  static async findByTutorId(tutorId, filters = {}) {
    try {
      const db = getDb();
      const { page = 1, limit = 20, status, dateFrom, dateTo } = filters;
      const offset = (page - 1) * limit;

      let query = db('session_earnings')
        .select('session_earnings.*', 'users.name as student_name', 'users.email as student_email')
        .leftJoin('users', 'session_earnings.student_id', 'users.id')
        .where('session_earnings.tutor_id', tutorId)
        .orderBy('session_earnings.session_date', 'desc');

      if (status) {
        query = query.where('session_earnings.status', status);
      }

      if (dateFrom) {
        query = query.where('session_earnings.session_date', '>=', dateFrom);
      }

      if (dateTo) {
        query = query.where('session_earnings.session_date', '<=', dateTo);
      }

      const earnings = await query.limit(limit).offset(offset);
      return earnings;
    } catch (error) {
      throw new Error(`Error finding tutor session earnings: ${error.message}`);
    }
  }

  static async updateStatus(earningsId, status, metadata = null) {
    try {
      const db = getDb();
      
      const updateData = {
        status: status,
        updated_at: new Date()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date();
      } else if (status === 'paid_out') {
        updateData.paid_out_at = new Date();
      }

      if (metadata) {
        updateData.metadata = JSON.stringify(metadata);
      }

      await db('session_earnings')
        .where('earnings_id', earningsId)
        .update(updateData);

      return await this.findById(earningsId);
    } catch (error) {
      throw new Error(`Error updating session earnings status: ${error.message}`);
    }
  }

  static calculateEarnings(sessionPrice, platformFeeRate = 0.20) {
    const price = parseFloat(sessionPrice);
    const feeRate = parseFloat(platformFeeRate);
    
    const platformFee = price * feeRate;
    const tutorEarning = price - platformFee;

    return {
      session_price: price,
      platform_fee: platformFee,
      tutor_earning: tutorEarning,
      platform_fee_rate: feeRate
    };
  }

  static async createFromBooking(bookingId, sessionDate) {
    try {
      const db = getDb();
      
      // 예약 정보 조회
      const booking = await db('bookings')
        .select('bookings.*', 'tutors.hourly_rate')
        .leftJoin('tutors', 'bookings.tutor_id', 'tutors.id')
        .where('bookings.id', bookingId)
        .first();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // 세션 가격 계산 (예약에서 session_price가 있으면 사용, 없으면 시간당 요금 * 시간)
      const sessionPrice = booking.session_price || 
        (booking.hourly_rate * (booking.duration_minutes / 60));

      // 플랫폼 수수료율 조회 (기본 20%)
      const feeSettings = await this.getCurrentFeeRate();
      const earnings = SessionEarnings.calculateEarnings(sessionPrice, feeSettings.fee_rate);

      // 세션 수익 레코드 생성
      const sessionEarningsData = {
        booking_id: bookingId,
        tutor_id: booking.tutor_id,
        student_id: booking.student_id,
        session_date: sessionDate,
        status: 'pending',
        ...earnings
      };

      return await this.create(sessionEarningsData);
    } catch (error) {
      throw new Error(`Error creating earnings from booking: ${error.message}`);
    }
  }

  static async getCurrentFeeRate() {
    try {
      const db = getDb();
      const now = new Date();
      
      const feeSettings = await db('platform_fee_settings')
        .where('is_active', true)
        .where('effective_from', '<=', now)
        .where(function() {
          this.whereNull('effective_until').orWhere('effective_until', '>', now);
        })
        .orderBy('effective_from', 'desc')
        .first();

      return feeSettings || {
        setting_name: 'default',
        fee_rate: 0.20, // 기본 20%
        description: 'Default platform fee rate'
      };
    } catch (error) {
      throw new Error(`Error getting current fee rate: ${error.message}`);
    }
  }

  static async getTotalEarnings(filters = {}) {
    try {
      const db = getDb();
      const { tutorId, status = 'completed', dateFrom, dateTo } = filters;

      let query = db('session_earnings')
        .sum('tutor_earning as total_tutor_earnings')
        .sum('platform_fee as total_platform_fees')
        .sum('session_price as total_revenue')
        .count('id as total_sessions');

      if (tutorId) {
        query = query.where('tutor_id', tutorId);
      }

      if (status) {
        query = query.where('status', status);
      }

      if (dateFrom) {
        query = query.where('session_date', '>=', dateFrom);
      }

      if (dateTo) {
        query = query.where('session_date', '<=', dateTo);
      }

      const result = await query.first();
      
      return {
        total_tutor_earnings: parseFloat(result.total_tutor_earnings) || 0,
        total_platform_fees: parseFloat(result.total_platform_fees) || 0,
        total_revenue: parseFloat(result.total_revenue) || 0,
        total_sessions: parseInt(result.total_sessions) || 0
      };
    } catch (error) {
      throw new Error(`Error getting total earnings: ${error.message}`);
    }
  }

  static async getEarningsByPeriod(period = 'month', tutorId = null) {
    try {
      const db = getDb();
      
      let dateFormat;
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-%W';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'year':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }

      let query = db('session_earnings')
        .select(
          db.raw(`strftime('${dateFormat}', session_date) as period`),
          db.raw('SUM(tutor_earning) as total_earnings'),
          db.raw('SUM(platform_fee) as total_fees'),
          db.raw('COUNT(*) as sessions_count')
        )
        .where('status', 'completed')
        .groupBy(db.raw(`strftime('${dateFormat}', session_date)`))
        .orderBy(db.raw(`strftime('${dateFormat}', session_date)`), 'desc');

      if (tutorId) {
        query = query.where('tutor_id', tutorId);
      }

      const results = await query;
      
      return results.map(row => ({
        period: row.period,
        total_earnings: parseFloat(row.total_earnings) || 0,
        total_fees: parseFloat(row.total_fees) || 0,
        sessions_count: parseInt(row.sessions_count) || 0,
        avg_earning_per_session: row.sessions_count > 0 
          ? (parseFloat(row.total_earnings) / parseInt(row.sessions_count)) 
          : 0
      }));
    } catch (error) {
      throw new Error(`Error getting earnings by period: ${error.message}`);
    }
  }
}

module.exports = SessionEarnings;