const { getDb } = require('../config/database-sqlite');

class PointPackage {
  static safeJSONParse(str, defaultValue) {
    try {
      return JSON.parse(str || JSON.stringify(defaultValue));
    } catch (error) {
      return defaultValue;
    }
  }

  static async findAll(filters = {}) {
    try {
      const db = getDb();
      const { active = true } = filters;

      let query = db('point_packages')
        .orderBy('sort_order', 'asc')
        .orderBy('price', 'asc');

      if (active !== null) {
        query = query.where('is_active', active);
      }

      const packages = await query;
      
      return packages.map(pkg => ({
        ...pkg,
        benefits: this.safeJSONParse(pkg.benefits, [])
      }));
    } catch (error) {
      throw new Error(`Error finding packages: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const db = getDb();
      const pkg = await db('point_packages')
        .where('id', id)
        .first();
      
      if (pkg) {
        pkg.benefits = this.safeJSONParse(pkg.benefits, []);
      }
      
      return pkg;
    } catch (error) {
      throw new Error(`Error finding package: ${error.message}`);
    }
  }

  static async create(packageData) {
    try {
      const db = getDb();
      
      const processedData = {
        ...packageData,
        benefits: JSON.stringify(packageData.benefits || [])
      };

      const [packageId] = await db('point_packages').insert(processedData);
      return await this.findById(packageId);
    } catch (error) {
      throw new Error(`Error creating package: ${error.message}`);
    }
  }

  static async update(id, packageData) {
    try {
      const db = getDb();
      
      const processedData = {
        ...packageData,
        updated_at: new Date()
      };

      if (packageData.benefits) {
        processedData.benefits = JSON.stringify(packageData.benefits);
      }

      await db('point_packages')
        .where('id', id)
        .update(processedData);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating package: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const db = getDb();
      
      // 실제 삭제 대신 비활성화
      await db('point_packages')
        .where('id', id)
        .update({
          is_active: false,
          updated_at: new Date()
        });

      return true;
    } catch (error) {
      throw new Error(`Error deleting package: ${error.message}`);
    }
  }

  static async getPopularPackages(limit = 3) {
    try {
      const db = getDb();
      
      // 가장 많이 구매된 패키지들을 찾기 위한 쿼리
      // 실제로는 구매 내역이 쌓인 후에 정확한 통계를 낼 수 있습니다
      const packages = await db('point_packages')
        .where('is_active', true)
        .orderBy('sort_order', 'asc')
        .limit(limit);

      return packages.map(pkg => ({
        ...pkg,
        benefits: this.safeJSONParse(pkg.benefits, [])
      }));
    } catch (error) {
      throw new Error(`Error finding popular packages: ${error.message}`);
    }
  }

  static calculateValue(points, price) {
    if (price <= 0) return 0;
    return (points / price * 100).toFixed(1); // 100원당 포인트 수
  }

  static async getPackageWithValue(id) {
    try {
      const pkg = await this.findById(id);
      if (!pkg) return null;

      const totalPoints = pkg.points + (pkg.bonus_points || 0);
      const value = this.calculateValue(totalPoints, pkg.price);

      return {
        ...pkg,
        total_points: totalPoints,
        value_per_100won: parseFloat(value),
        is_best_value: false // 이후 로직에서 계산
      };
    } catch (error) {
      throw new Error(`Error getting package with value: ${error.message}`);
    }
  }
}

module.exports = PointPackage;