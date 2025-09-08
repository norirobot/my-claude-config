const { getDb } = require('../config/database-sqlite');

class Tutor {
  static safeJSONParse(str, defaultValue) {
    try {
      return JSON.parse(str || JSON.stringify(defaultValue));
    } catch (error) {
      return defaultValue;
    }
  }

  static async create(tutorData) {
    try {
      const db = getDb();
      // SQLite doesn't support returning() the same way as PostgreSQL
      // So we insert and then get the lastID
      const result = await db('tutors').insert(tutorData);
      const insertId = Array.isArray(result) ? result[0] : result;
      return await this.findById(insertId);
    } catch (error) {
      throw new Error(`Error creating tutor: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const db = getDb();
      const tutor = await db('tutors')
        .select('tutors.*', 'users.email', 'users.name', 'users.profile_image')
        .leftJoin('users', 'tutors.user_id', 'users.id')
        .where('tutors.id', id)
        .first();
      
      if (tutor) {
        tutor.languages_spoken = this.safeJSONParse(tutor.languages_spoken, []);
        tutor.certifications = this.safeJSONParse(tutor.certifications, []);
        tutor.available_times = this.safeJSONParse(tutor.available_times, {});
      }
      
      return tutor;
    } catch (error) {
      throw new Error(`Error finding tutor by ID: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    try {
      const db = getDb();
      let query = db('tutors')
        .select('tutors.*', 'users.email', 'users.name', 'users.profile_image')
        .leftJoin('users', 'tutors.user_id', 'users.id')
        .where('tutors.is_available', true);

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);

      const tutors = await query;
      
      return tutors.map(tutor => ({
        ...tutor,
        languages_spoken: this.safeJSONParse(tutor.languages_spoken, []),
        certifications: this.safeJSONParse(tutor.certifications, []),
        available_times: this.safeJSONParse(tutor.available_times, {})
      }));
    } catch (error) {
      throw new Error(`Error finding tutors: ${error.message}`);
    }
  }
}

module.exports = Tutor;
