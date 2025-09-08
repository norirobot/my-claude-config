const { getDb } = require('../config/database-sqlite');

class PointTransaction {
  static async findByUserId(userId, filters = {}) {
    try {
      const db = getDb();
      const { page = 1, limit = 20, type, status } = filters;
      const offset = (page - 1) * limit;

      let query = db('point_transactions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc');

      if (type) {
        query = query.where('type', type);
      }

      if (status) {
        query = query.where('status', status);
      }

      const transactions = await query.limit(limit).offset(offset);
      return transactions;
    } catch (error) {
      throw new Error(`Error finding transactions: ${error.message}`);
    }
  }

  static async findById(transactionId) {
    try {
      const db = getDb();
      const transaction = await db('point_transactions')
        .where('transaction_id', transactionId)
        .first();
      
      return transaction;
    } catch (error) {
      throw new Error(`Error finding transaction: ${error.message}`);
    }
  }

  static async create(transactionData) {
    try {
      const db = getDb();
      
      const transactionId = `TXN_${Date.now()}_${transactionData.user_id}`;
      const fullTransactionData = {
        transaction_id: transactionId,
        ...transactionData,
        status: transactionData.status || 'pending'
      };

      await db('point_transactions').insert(fullTransactionData);
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  static async updateStatus(transactionId, status, metadata = null) {
    try {
      const db = getDb();
      
      const updateData = {
        status: status,
        updated_at: new Date()
      };

      if (metadata) {
        updateData.metadata = JSON.stringify(metadata);
      }

      await db('point_transactions')
        .where('transaction_id', transactionId)
        .update(updateData);

      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Error updating transaction: ${error.message}`);
    }
  }

  static async getTransactionStats(userId, period = '30days') {
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

      const stats = await db('point_transactions')
        .where('user_id', userId)
        .where('created_at', '>=', dateFilter)
        .where('status', 'completed')
        .select(
          db.raw('COUNT(*) as total_transactions'),
          db.raw('SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned'),
          db.raw('SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent'),
          db.raw('SUM(amount) as net_change')
        )
        .first();

      return {
        total_transactions: parseInt(stats.total_transactions) || 0,
        total_earned: parseFloat(stats.total_earned) || 0,
        total_spent: parseFloat(stats.total_spent) || 0,
        net_change: parseFloat(stats.net_change) || 0,
        period: period
      };
    } catch (error) {
      throw new Error(`Error getting transaction stats: ${error.message}`);
    }
  }

  static async getAllTransactions(filters = {}) {
    try {
      const db = getDb();
      const { page = 1, limit = 50, type, status } = filters;
      const offset = (page - 1) * limit;

      let query = db('point_transactions')
        .select('point_transactions.*', 'users.name', 'users.email')
        .leftJoin('users', 'point_transactions.user_id', 'users.id')
        .orderBy('point_transactions.created_at', 'desc');

      if (type) {
        query = query.where('point_transactions.type', type);
      }

      if (status) {
        query = query.where('point_transactions.status', status);
      }

      const transactions = await query.limit(limit).offset(offset);
      return transactions;
    } catch (error) {
      throw new Error(`Error finding all transactions: ${error.message}`);
    }
  }
}

module.exports = PointTransaction;