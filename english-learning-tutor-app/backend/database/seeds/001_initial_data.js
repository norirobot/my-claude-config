const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('voice_recordings').del();
  await knex('user_progress').del();
  await knex('practice_sessions').del();
  await knex('tutors').del();
  await knex('users').del();
  
  // Insert test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await knex('users').insert([
    {
      email: 'student@test.com',
      password: hashedPassword,
      name: '김민수',
      phone: '010-1234-5678',
      role: 'student',
      level: 'intermediate',
      points: 150,
      streak_days: 5,
      last_activity_date: new Date(),
      preferences: JSON.stringify({
        notifications: true,
        daily_goal_minutes: 30,
        preferred_topics: ['business', 'travel']
      }),
      is_active: true,
      email_verified: true
    },
    {
      email: 'tutor@test.com',
      password: hashedPassword,
      name: 'John Smith',
      phone: '010-9876-5432',
      role: 'tutor',
      level: 'advanced',
      points: 0,
      streak_days: 0,
      is_active: true,
      email_verified: true
    },
    {
      email: 'admin@test.com',
      password: hashedPassword,
      name: '관리자',
      phone: '010-5555-5555',
      role: 'admin',
      level: 'advanced',
      points: 0,
      streak_days: 0,
      is_active: true,
      email_verified: true
    }
  ]).returning('id');
  
  // Insert tutor profile for the tutor user
  const tutorUserId = users[1];
  await knex('tutors').insert({
    user_id: tutorUserId,
    specialty: 'Business English',
    bio: 'Native English speaker with 10+ years of teaching experience. Specialized in business English and TOEIC preparation.',
    hourly_rate: 50000,
    available_times: JSON.stringify({
      monday: ['09:00-12:00', '14:00-18:00'],
      tuesday: ['09:00-12:00', '14:00-18:00'],
      wednesday: ['09:00-12:00', '14:00-18:00'],
      thursday: ['09:00-12:00', '14:00-18:00'],
      friday: ['09:00-12:00', '14:00-16:00']
    }),
    languages_spoken: JSON.stringify(['English', 'Korean', 'Spanish']),
    certifications: JSON.stringify(['TESOL', 'CELTA', 'Masters in Education']),
    years_experience: 10,
    rating: 4.8,
    total_reviews: 45,
    total_sessions: 320,
    is_verified: true,
    is_available: true,
    location_city: '대구',
    location_region: '수성구'
  });
  
  // Insert sample practice session for the student
  const studentUserId = users[0];
  const sessionId = 'session_' + Date.now();
  
  await knex('practice_sessions').insert({
    user_id: studentUserId,
    session_id: sessionId,
    situation_type: 'restaurant',
    situation_title: '레스토랑에서 주문하기',
    difficulty: 'medium',
    started_at: new Date(Date.now() - 3600000), // 1 hour ago
    ended_at: new Date(Date.now() - 1800000), // 30 minutes ago
    duration_seconds: 1800,
    conversation_history: JSON.stringify([
      { role: 'ai', message: 'Welcome to our restaurant! How can I help you today?' },
      { role: 'user', message: 'I would like to see the menu please.' },
      { role: 'ai', message: 'Of course! Here is our menu. Would you like me to recommend our special dishes?' },
      { role: 'user', message: 'Yes, what do you recommend?' }
    ]),
    overall_score: 85,
    pronunciation_score: 82,
    grammar_score: 88,
    fluency_score: 84,
    vocabulary_score: 86,
    ai_feedback: JSON.stringify({
      strengths: ['Good use of polite expressions', 'Clear pronunciation'],
      improvements: ['Try to use more varied vocabulary', 'Work on intonation patterns'],
      suggestions: ['Practice ordering different types of food', 'Learn more restaurant-specific vocabulary']
    }),
    points_earned: 25,
    status: 'completed'
  });
  
  // Insert sample progress data
  await knex('user_progress').insert({
    user_id: studentUserId,
    date: new Date().toISOString().split('T')[0],
    practice_minutes: 30,
    sessions_completed: 1,
    words_learned: 12,
    points_earned: 25,
    average_pronunciation_score: 82,
    average_grammar_score: 88,
    average_fluency_score: 84,
    situations_practiced: JSON.stringify(['restaurant']),
    weak_areas: JSON.stringify(['intonation', 'vocabulary variety']),
    achievements_unlocked: JSON.stringify(['first_session', 'streak_5_days'])
  });
  
  console.log('✅ Seed data inserted successfully!');
};