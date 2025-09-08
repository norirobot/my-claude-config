const { getDb } = require('../config/database-sqlite');

class Booking {
  static async create(bookingData) {
    try {
      const db = getDb();
      const [id] = await db('bookings').insert(bookingData).returning('id');
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const db = getDb();
      const booking = await db('bookings')
        .select(
          'bookings.*',
          'users.name as student_name',
          'users.email as student_email'
        )
        .leftJoin('users', 'bookings.student_id', 'users.id')
        .where('bookings.id', id)
        .first();
      
      return booking;
    } catch (error) {
      throw new Error(`Error finding booking by ID: ${error.message}`);
    }
  }

  static async findByStudent(studentId, status = null) {
    try {
      const db = getDb();
      let query = db('bookings')
        .select('bookings.*')
        .where('bookings.student_id', studentId)
        .orderBy('bookings.scheduled_at', 'desc');

      if (status) {
        query = query.where('bookings.status', status);
      }

      return await query;
    } catch (error) {
      throw new Error(`Error finding bookings by student: ${error.message}`);
    }
  }
}

module.exports = Booking;
