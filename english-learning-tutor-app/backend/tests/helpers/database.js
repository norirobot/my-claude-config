const knex = require('knex');
const knexConfig = require('../../knexfile');

let testDb = null;

/**
 * Setup test database
 */
async function setupTestDatabase() {
  try {
    // Use test environment config or create in-memory database
    const config = knexConfig.test || {
      client: 'sqlite3',
      connection: {
        filename: ':memory:'
      },
      useNullAsDefault: true,
      pool: {
        afterCreate: (conn, done) => {
          // Enable foreign key constraints in SQLite
          conn.run('PRAGMA foreign_keys = ON', done);
        }
      },
      migrations: {
        directory: './database/migrations'
      },
      seeds: {
        directory: './database/seeds'
      }
    };

    testDb = knex(config);
    
    // Run migrations
    await testDb.migrate.latest();
    
    return testDb;
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }
}

/**
 * Clean test database
 */
async function cleanTestDatabase() {
  if (!testDb) return;
  
  try {
    // Get all table names
    const tables = await testDb.raw(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'knex_migrations' AND name != 'knex_migrations_lock'
    `);
    
    // Clean all tables in reverse order (to handle foreign keys)
    const tableNames = tables.map(row => row.name).reverse();
    for (const tableName of tableNames) {
      await testDb(tableName).truncate();
    }
  } catch (error) {
    console.error('Test database cleanup failed:', error);
    throw error;
  }
}

/**
 * Tear down test database
 */
async function teardownTestDatabase() {
  if (testDb) {
    await testDb.destroy();
    testDb = null;
  }
}

/**
 * Get test database instance
 */
function getTestDb() {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testDb;
}

/**
 * Seed test data
 */
async function seedTestData() {
  const db = getTestDb();
  
  // Create test users
  await db('users').insert([
    { id: 1, email: 'student@test.com', name: 'Test Student', password: 'hashedpass1' },
    { id: 2, email: 'tutor@test.com', name: 'Test Tutor', password: 'hashedpass2' }
  ]);
  
  // Create test tutors
  await db('tutors').insert([
    {
      id: 1,
      user_id: 2,
      specialty: 'Business English',
      bio: 'Test tutor for business English',
      hourly_rate: 50.00,
      available_times: JSON.stringify({ monday: ['09:00', '10:00'] }),
      languages_spoken: JSON.stringify(['English', 'Korean']),
      certifications: JSON.stringify(['TESOL']),
      years_experience: 5,
      rating: 4.5,
      total_reviews: 10,
      total_sessions: 50,
      is_verified: true,
      is_available: true,
      location_city: 'Seoul',
      location_region: 'Gangnam-gu'
    }
  ]);
  
  // Create test bookings
  await db('bookings').insert([
    {
      id: 1,
      student_id: 1,
      tutor_id: 1,
      scheduled_at: new Date('2025-12-01 10:00:00'),
      duration_minutes: 60,
      status: 'pending',
      session_price: 50.00
    }
  ]);
}

module.exports = {
  setupTestDatabase,
  cleanTestDatabase,
  teardownTestDatabase,
  getTestDb,
  seedTestData
};