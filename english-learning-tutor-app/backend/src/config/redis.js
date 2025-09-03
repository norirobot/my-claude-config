const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB || 0,
};

/**
 * Initialize Redis connection
 */
async function connectRedis() {
  try {
    redisClient = redis.createClient(redisConfig);
    
    // Handle Redis events
    redisClient.on('connect', () => {
      logger.info('🔌 Redis client connected');
    });
    
    redisClient.on('ready', () => {
      logger.info('✅ Redis client ready');
    });
    
    redisClient.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
    });
    
    redisClient.on('end', () => {
      logger.info('🔌 Redis client connection closed');
    });
    
    // Connect to Redis
    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    logger.info('🏓 Redis ping successful');
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

/**
 * Cache helper functions
 */
const cache = {
  /**
   * Set a value in cache with optional expiration
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
      logger.debug(`💾 Cache set: ${key}`);
    } catch (error) {
      logger.error(`❌ Cache set error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (value) {
        logger.debug(`🎯 Cache hit: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`💨 Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`❌ Cache get error for key ${key}:`, error);
      return null; // Return null on cache errors to not break the app
    }
  },

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await redisClient.del(key);
      logger.debug(`🗑️ Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`❌ Cache delete error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists
   */
  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`❌ Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Set expiration for a key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    try {
      await redisClient.expire(key, ttl);
      logger.debug(`⏰ Cache expiration set: ${key} (${ttl}s)`);
    } catch (error) {
      logger.error(`❌ Cache expire error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Increment a numeric value in cache
   * @param {string} key - Cache key
   * @param {number} increment - Increment value (default: 1)
   */
  async incr(key, increment = 1) {
    try {
      const result = await redisClient.incrBy(key, increment);
      logger.debug(`📈 Cache incremented: ${key} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`❌ Cache increment error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Add item to a list (left push)
   * @param {string} key - List key
   * @param {any} value - Value to add
   */
  async lpush(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.lPush(key, serializedValue);
      logger.debug(`📝 List push: ${key}`);
    } catch (error) {
      logger.error(`❌ List push error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get items from a list
   * @param {string} key - List key
   * @param {number} start - Start index (default: 0)
   * @param {number} stop - Stop index (default: -1 for all)
   */
  async lrange(key, start = 0, stop = -1) {
    try {
      const values = await redisClient.lRange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      logger.error(`❌ List range error for key ${key}:`, error);
      throw error;
    }
  }
};

/**
 * Session management helpers
 */
const session = {
  /**
   * Store user session
   * @param {string} sessionId - Session ID
   * @param {object} sessionData - Session data
   * @param {number} ttl - Time to live in seconds (default: 7 days)
   */
  async set(sessionId, sessionData, ttl = 7 * 24 * 60 * 60) {
    const key = `session:${sessionId}`;
    await cache.set(key, sessionData, ttl);
  },

  /**
   * Get user session
   * @param {string} sessionId - Session ID
   * @returns {Promise<object|null>} Session data or null
   */
  async get(sessionId) {
    const key = `session:${sessionId}`;
    return await cache.get(key);
  },

  /**
   * Delete user session
   * @param {string} sessionId - Session ID
   */
  async delete(sessionId) {
    const key = `session:${sessionId}`;
    await cache.del(key);
  }
};

/**
 * Close Redis connection
 */
async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('✅ Redis connection closed');
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  cache,
  session,
  closeRedisConnection,
};