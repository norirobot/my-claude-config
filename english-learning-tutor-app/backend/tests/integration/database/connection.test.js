const { setupTestDatabase, teardownTestDatabase } = require('../../helpers/database');

describe('Database Connection Tests', () => {
  let testDb;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Database connectivity', () => {
    test('should connect to database successfully', async () => {
      expect(testDb).toBeDefined();
      
      // Test basic query
      const result = await testDb.raw('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result[0].test).toBe(1);
    });

    test('should have all required tables', async () => {
      const tables = await testDb.raw(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'knex_%'
      `);
      
      const tableNames = tables.map(row => row.name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('tutors');
      expect(tableNames).toContain('bookings');
      expect(tableNames).toContain('practice_sessions');
    });

    test('should handle concurrent connections', async () => {
      const queries = Array(10).fill(0).map((_, i) => 
        testDb.raw('SELECT ? as test', [i])
      );
      
      const results = await Promise.all(queries);
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result[0].test).toBe(index);
      });
    });
  });

  describe('Migration integrity', () => {
    test('should have proper foreign key constraints', async () => {
      // Test tutors -> users relationship
      await expect(
        testDb('tutors').insert({
          user_id: 9999, // Non-existent user
          specialty: 'Test',
          bio: 'Test bio',
          hourly_rate: 50,
          available_times: '{}',
          languages_spoken: '[]',
          certifications: '[]',
          years_experience: 1,
          location_city: 'Test',
          location_region: 'Test'
        })
      ).rejects.toThrow();
    });

    test('should enforce required fields', async () => {
      // Test required fields in tutors table
      await expect(
        testDb('tutors').insert({
          // Missing required fields like user_id, specialty, etc.
          bio: 'Test bio'
        })
      ).rejects.toThrow();
    });

    test('should handle JSON fields properly', async () => {
      // Insert user first
      await testDb('users').insert({
        id: 999,
        email: 'test@json.com',
        name: 'JSON Test',
        password: 'test'
      });

      const jsonData = {
        monday: ['09:00', '10:00'],
        tuesday: ['14:00', '15:00']
      };

      await testDb('tutors').insert({
        user_id: 999,
        specialty: 'JSON Test',
        bio: 'Testing JSON fields',
        hourly_rate: 40,
        available_times: JSON.stringify(jsonData),
        languages_spoken: JSON.stringify(['English']),
        certifications: JSON.stringify(['Test Cert']),
        years_experience: 3,
        location_city: 'Seoul',
        location_region: 'Test'
      });

      const tutor = await testDb('tutors').where('user_id', 999).first();
      expect(JSON.parse(tutor.available_times)).toEqual(jsonData);
    });
  });

  describe('Performance tests', () => {
    test('should handle bulk inserts efficiently', async () => {
      // Create test users first
      const users = Array(100).fill(0).map((_, i) => ({
        id: 1000 + i,
        email: `bulk${i}@test.com`,
        name: `Bulk User ${i}`,
        password: 'testpass'
      }));
      
      await testDb('users').insert(users);

      // Bulk insert tutors
      const tutors = Array(100).fill(0).map((_, i) => ({
        user_id: 1000 + i,
        specialty: `Specialty ${i}`,
        bio: `Bio for tutor ${i}`,
        hourly_rate: 30 + (i % 50),
        available_times: JSON.stringify({}),
        languages_spoken: JSON.stringify(['English']),
        certifications: JSON.stringify([]),
        years_experience: 1 + (i % 10),
        location_city: 'Seoul',
        location_region: 'Test'
      }));

      const startTime = Date.now();
      await testDb('tutors').insert(tutors);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
      
      const count = await testDb('tutors').count('id as count').first();
      expect(count.count).toBeGreaterThan(100);
    });

    test('should handle complex queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await testDb('tutors')
        .select('tutors.*', 'users.name', 'users.email')
        .leftJoin('users', 'tutors.user_id', 'users.id')
        .where('tutors.is_available', true)
        .where('tutors.rating', '>=', 4.0)
        .orderBy('tutors.rating', 'desc')
        .limit(20);
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle invalid SQL gracefully', async () => {
      await expect(
        testDb.raw('SELECT * FROM non_existent_table')
      ).rejects.toThrow();
    });

    test('should handle transaction rollbacks', async () => {
      const trx = await testDb.transaction();
      
      try {
        await trx('users').insert({
          id: 9998,
          email: 'transaction@test.com',
          name: 'Transaction Test',
          password: 'test'
        });
        
        // Force an error
        await trx('tutors').insert({
          user_id: 9999, // This should fail due to foreign key constraint
          specialty: 'Test'
        });
        
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        
        // Verify rollback worked
        const user = await testDb('users').where('id', 9998).first();
        expect(user).toBeUndefined();
      }
    });
  });
});