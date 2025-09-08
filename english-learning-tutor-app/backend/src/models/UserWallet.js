const { getDb } = require('../config/database-sqlite');

class UserWallet {
  static async findByUserId(userId) {
    try {
      const db = getDb();
      const wallet = await db('user_wallets')
        .where('user_id', userId)
        .first();
      
      return wallet;
    } catch (error) {
      throw new Error(`Error finding wallet: ${error.message}`);
    }
  }

  static async createWallet(userId, initialBalance = 0) {
    try {
      const db = getDb();
      
      // 이미 지갑이 있는지 확인
      const existingWallet = await this.findByUserId(userId);
      if (existingWallet) {
        return existingWallet;
      }

      const [walletId] = await db('user_wallets').insert({
        user_id: userId,
        balance: initialBalance,
        pending_balance: 0,
        last_updated: new Date()
      });

      return await db('user_wallets').where('id', walletId).first();
    } catch (error) {
      throw new Error(`Error creating wallet: ${error.message}`);
    }
  }

  static async updateBalance(userId, amount, description = null) {
    const db = getDb();
    
    try {
      return await db.transaction(async (trx) => {
        // 현재 지갑 조회 (FOR UPDATE로 락 설정)
        const wallet = await trx('user_wallets')
          .where('user_id', userId)
          .first()
          .forUpdate();

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        const balanceBefore = parseFloat(wallet.balance);
        const balanceAfter = balanceBefore + amount;

        // 잔액이 음수가 되지 않도록 체크
        if (balanceAfter < 0) {
          throw new Error('Insufficient balance');
        }

        // 지갑 잔액 업데이트
        await trx('user_wallets')
          .where('user_id', userId)
          .update({
            balance: balanceAfter,
            last_updated: new Date()
          });

        // 거래 내역 생성
        const transactionId = `TXN_${Date.now()}_${userId}`;
        await trx('point_transactions').insert({
          transaction_id: transactionId,
          user_id: userId,
          type: amount > 0 ? 'charge' : 'spend',
          amount: amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: description || (amount > 0 ? 'Points charged' : 'Points spent'),
          status: 'completed'
        });

        return {
          transaction_id: transactionId,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          amount: amount
        };
      });
    } catch (error) {
      throw new Error(`Error updating balance: ${error.message}`);
    }
  }

  static async getBalance(userId) {
    try {
      const wallet = await this.findByUserId(userId);
      return wallet ? parseFloat(wallet.balance) : 0;
    } catch (error) {
      throw new Error(`Error getting balance: ${error.message}`);
    }
  }

  static async getAllWallets() {
    try {
      const db = getDb();
      const wallets = await db('user_wallets')
        .select('user_wallets.*', 'users.name', 'users.email')
        .leftJoin('users', 'user_wallets.user_id', 'users.id')
        .orderBy('user_wallets.balance', 'desc');
      
      return wallets;
    } catch (error) {
      throw new Error(`Error finding wallets: ${error.message}`);
    }
  }
}

module.exports = UserWallet;