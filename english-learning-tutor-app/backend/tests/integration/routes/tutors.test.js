const request = require('supertest');
const { setupTestDatabase, teardownTestDatabase, cleanTestDatabase, seedTestData } = require('../../helpers/database');

// Mock the database module
const mockGetDb = jest.fn();
const mockConnectDatabase = jest.fn();

jest.mock('../../../src/config/database-sqlite', () => ({
  getDb: mockGetDb,
  connectDatabase: mockConnectDatabase
}));

describe('Tutors API Integration Tests', () => {
  let app;
  let testDb;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
    mockGetDb.mockReturnValue(testDb);
    mockConnectDatabase.mockResolvedValue(testDb);
    
    // Import app after mocking
    app = require('../../../src/server');
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    await seedTestData();
  });

  describe('GET /api/tutors', () => {
    test('should return list of tutors with success response', async () => {
      const response = await request(app)
        .get('/api/tutors')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array)
      });

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: 1,
        specialty: 'Business English',
        hourly_rate: 50,
        rating: 4.5,
        is_verified: 1,
        is_available: 1
      });
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/tutors?page=1&limit=5')
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number)
      });
    });

    test('should return empty array when no tutors available', async () => {
      await testDb('tutors').where('id', '>', 0).del();
      
      const response = await request(app)
        .get('/api/tutors')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    test('should handle database errors gracefully', async () => {
      mockGetDb.mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/tutors')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Failed to fetch tutors'
      });
    });
  });

  describe('GET /api/tutors/:id', () => {
    test('should return specific tutor by ID', async () => {
      const response = await request(app)
        .get('/api/tutors/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: 1,
          specialty: 'Business English',
          name: 'Test Tutor',
          email: 'tutor@test.com'
        }
      });
    });

    test('should return 404 for non-existent tutor', async () => {
      const response = await request(app)
        .get('/api/tutors/999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Tutor not found'
      });
    });

    test('should handle invalid ID format', async () => {
      const response = await request(app)
        .get('/api/tutors/invalid-id')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Tutor not found'
      });
    });
  });

  describe('Error handling', () => {
    test('should handle malformed requests', async () => {
      const response = await request(app)
        .get('/api/tutors?page=invalid')
        .expect(200); // Should handle gracefully with defaults

      expect(response.body.pagination.page).toBe(1);
    });

    test('should return appropriate headers', async () => {
      const response = await request(app)
        .get('/api/tutors')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should handle large limit parameters', async () => {
      const response = await request(app)
        .get('/api/tutors?limit=1000000')
        .expect(200);

      // Should not crash and return reasonable results
      expect(response.body.success).toBe(true);
    });
  });

  describe('Data integrity', () => {
    test('should return tutors with proper data types', async () => {
      const response = await request(app)
        .get('/api/tutors')
        .expect(200);

      const tutor = response.body.data[0];
      expect(typeof tutor.id).toBe('number');
      expect(typeof tutor.hourly_rate).toBe('number');
      expect(typeof tutor.years_experience).toBe('number');
      expect(Array.isArray(tutor.languages_spoken)).toBe(true);
      expect(Array.isArray(tutor.certifications)).toBe(true);
      expect(typeof tutor.available_times).toBe('object');
    });

    test('should not expose sensitive information', async () => {
      const response = await request(app)
        .get('/api/tutors/1')
        .expect(200);

      const tutor = response.body.data;
      // Should not expose password or other sensitive fields
      expect(tutor.password).toBeUndefined();
      expect(tutor.auth_token).toBeUndefined();
    });

    test('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/tutors?specialty=Business%20English')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});