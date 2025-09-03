const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Database connection pool
let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'english_learning_app',
  user: process.env.DB_USER || 'dev_user',
  password: process.env.DB_PASSWORD || 'dev_password',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times
};

/**
 * Initialize database connection pool
 */
async function connectDatabase() {
  try {
    pool = new Pool(dbConfig);
    
    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    logger.info(`📊 Database connected at: ${result.rows[0].current_time}`);
    client.release();
    
    // Handle pool errors
    pool.on('error', (err, client) => {
      logger.error('❌ Unexpected error on idle client', err);
      process.exit(-1);
    });
    
    return pool;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Get database pool instance
 */
function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`🔍 Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
    }
    
    return result;
  } catch (error) {
    logger.error(`❌ Database query error: ${error.message}`);
    logger.error(`Query: ${text}`);
    logger.error(`Params: ${JSON.stringify(params)}`);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    logger.error('❌ Failed to get database client:', error);
    throw error;
  }
}

/**
 * Execute a transaction
 * @param {Function} callback - Function to execute within transaction
 * @returns {Promise} Transaction result
 */
async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Transaction failed, rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 */
async function closeDatabaseConnection() {
  if (pool) {
    await pool.end();
    logger.info('✅ Database connection pool closed');
  }
}

module.exports = {
  connectDatabase,
  getPool,
  query,
  getClient,
  transaction,
  closeDatabaseConnection,
};