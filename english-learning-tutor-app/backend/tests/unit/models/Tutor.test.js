const { setupTestDatabase, teardownTestDatabase, cleanTestDatabase, seedTestData } = require('../../helpers/database');

// Mock the database module to use test database
const mockGetDb = jest.fn();
jest.mock('../../../src/config/database-sqlite', () => ({
  getDb: mockGetDb
}));

const Tutor = require('../../../src/models/Tutor');

describe('Tutor Model', () => {
  let testDb;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
    mockGetDb.mockReturnValue(testDb);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    await seedTestData();
  });

  describe('findAll', () => {
    test('should return all available tutors', async () => {
      const tutors = await Tutor.findAll();
      
      expect(tutors).toHaveLength(1);
      expect(tutors[0]).toMatchObject({
        id: 1,
        specialty: 'Business English',
        hourly_rate: 50,
        is_available: 1,
        location_city: 'Seoul'
      });
      expect(tutors[0].languages_spoken).toEqual(['English', 'Korean']);
      expect(tutors[0].certifications).toEqual(['TESOL']);
    });

    test('should apply pagination correctly', async () => {
      // Add more test tutors
      await testDb('tutors').insert([
        {
          user_id: 1,
          specialty: 'Conversation',
          bio: 'Test conversation tutor',
          hourly_rate: 40,
          available_times: JSON.stringify({}),
          languages_spoken: JSON.stringify(['English']),
          certifications: JSON.stringify([]),
          years_experience: 3,
          rating: 4.0,
          is_verified: true,
          is_available: true,
          location_city: 'Seoul',
          location_region: 'Hongdae'
        }
      ]);

      const tutors = await Tutor.findAll({ page: 1, limit: 1 });
      expect(tutors).toHaveLength(1);
    });

    test('should handle empty results', async () => {
      await testDb('tutors').where('id', '>', 0).del();
      
      const tutors = await Tutor.findAll();
      expect(tutors).toHaveLength(0);
    });
  });

  describe('findById', () => {
    test('should return tutor by ID with user information', async () => {
      const tutor = await Tutor.findById(1);
      
      expect(tutor).toMatchObject({
        id: 1,
        specialty: 'Business English',
        hourly_rate: 50,
        name: 'Test Tutor',
        email: 'tutor@test.com'
      });
      expect(tutor.languages_spoken).toEqual(['English', 'Korean']);
    });

    test('should return null for non-existent tutor', async () => {
      const tutor = await Tutor.findById(999);
      expect(tutor).toBeUndefined();
    });

    test('should handle invalid ID gracefully', async () => {
      const tutor = await Tutor.findById('invalid');
      expect(tutor).toBeUndefined();
    });
  });

  describe('create', () => {
    test('should create new tutor successfully', async () => {
      // First create a new user for this tutor
      await testDb('users').insert({
        id: 3,
        email: 'newtutor@test.com',
        name: 'New Tutor',
        password: 'hashedpass3'
      });

      const tutorData = {
        user_id: 3,
        specialty: 'IELTS Preparation',
        bio: 'Experienced IELTS tutor',
        hourly_rate: 60,
        available_times: JSON.stringify({ monday: ['14:00'] }),
        languages_spoken: JSON.stringify(['English', 'Korean']),
        certifications: JSON.stringify(['IELTS Trainer']),
        years_experience: 7,
        location_city: 'Seoul',
        location_region: 'Gangnam-gu'
      };

      const createdTutor = await Tutor.create(tutorData);
      
      expect(createdTutor).toMatchObject({
        specialty: 'IELTS Preparation',
        hourly_rate: 60,
        years_experience: 7
      });
      expect(createdTutor.id).toBeDefined();
    });

    test('should handle missing required fields', async () => {
      const incompleteTutorData = {
        specialty: 'Test'
        // Missing required fields
      };

      await expect(Tutor.create(incompleteTutorData)).rejects.toThrow();
    });

    test('should handle foreign key constraint violation', async () => {
      const tutorData = {
        user_id: 9999, // Non-existent user
        specialty: 'Grammar',
        bio: 'Grammar specialist',
        hourly_rate: 45,
        available_times: JSON.stringify({}),
        languages_spoken: JSON.stringify(['English']),
        certifications: JSON.stringify([]),
        years_experience: 4,
        location_city: 'Seoul',
        location_region: 'Mapo-gu'
      };

      await expect(Tutor.create(tutorData)).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    test('should handle database connection errors', async () => {
      mockGetDb.mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      await expect(Tutor.findAll()).rejects.toThrow('Database connection failed');
    });

    test('should handle malformed JSON in database', async () => {
      // Insert tutor with invalid JSON
      await testDb('tutors').insert({
        user_id: 1,
        specialty: 'Test',
        bio: 'Test bio',
        hourly_rate: 50,
        available_times: 'invalid-json',
        languages_spoken: '["English"]',
        certifications: '[]',
        years_experience: 5,
        is_verified: true,
        is_available: true,
        location_city: 'Seoul',
        location_region: 'Test'
      });

      const tutors = await Tutor.findAll();
      // Should handle gracefully by defaulting to empty object/array
      expect(tutors[1].available_times).toEqual({});
    });
  });
});