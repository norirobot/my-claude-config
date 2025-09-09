const knex = require('knex');
const knexConfig = require('../../knexfile');
const { logger } = require('../utils/logger');

// Initialize Knex instance
let db = null;

/**
 * Initialize database connection
 */
async function connectDatabase() {
  try {
    const environment = process.env.NODE_ENV || 'development';
    db = knex(knexConfig[environment]);
    
    // Test the connection
    const result = await db.raw('SELECT datetime("now") as current_time');
    logger.info(`📊 SQLite Database connected at: ${result[0].current_time}`);
    
    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

/**
 * Execute a query with parameters
 * @param {string} table - Table name
 * @returns {Object} Knex query builder
 */
function query(table) {
  return getDb()(table);
}

/**
 * Execute raw SQL query
 * @param {string} sql - SQL query
 * @param {Array} bindings - Query parameters
 */
async function raw(sql, bindings = []) {
  const start = Date.now();
  try {
    const result = await getDb().raw(sql, bindings);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`🔍 Query executed in ${duration}ms: ${sql.substring(0, 50)}...`);
    }
    
    return result;
  } catch (error) {
    logger.error(`❌ Database query error: ${error.message}`);
    logger.error(`Query: ${sql}`);
    logger.error(`Bindings: ${JSON.stringify(bindings)}`);
    throw error;
  }
}

/**
 * Execute a transaction
 * @param {Function} callback - Function to execute within transaction
 * @returns {Promise} Transaction result
 */
async function transaction(callback) {
  try {
    const result = await getDb().transaction(callback);
    return result;
  } catch (error) {
    logger.error('❌ Transaction failed, rolled back:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabaseConnection() {
  if (db) {
    await db.destroy();
    logger.info('✅ Database connection closed');
  }
}

module.exports = {
  connectDatabase,
  getDb,
  query,
  raw,
  transaction,
  closeDatabaseConnection,
};