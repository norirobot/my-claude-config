exports.seed = async function(knex) {
  // 기존 튜터 데이터 삭제
  await knex('tutors').del();

  // 샘플 튜터 데이터 삽입
  await knex('tutors').insert([
    {
      user_id: 1,
      specialty: 'Business English',
      bio: 'Experienced business English tutor with 8 years of experience helping professionals improve their communication skills in corporate environments. Specialized in presentations, meetings, and email communication.',
      hourly_rate: 45.00,
      available_times: JSON.stringify({
        'monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'thursday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        'friday': ['09:00', '10:00', '11:00', '14:00', '15:00']
      }),
      languages_spoken: JSON.stringify(['English', 'Korean']),
      certifications: JSON.stringify(['TESOL', 'TOEIC Speaking Instructor']),
      years_experience: 8,
      rating: 4.8,
      total_reviews: 156,
      total_sessions: 892,
      is_verified: true,
      is_available: true,
      location_city: 'Seoul',
      location_region: 'Gangnam-gu'
    },
    {
      user_id: 2,
      specialty: 'Conversation Practice',
      bio: 'Native English speaker from Canada living in Seoul for 5 years. I love helping students build confidence in everyday conversation through fun and engaging discussions about culture, hobbies, and daily life.',
      hourly_rate: 35.00,
      available_times: JSON.stringify({
        'monday': ['19:00', '20:00', '21:00'],
        'tuesday': ['19:00', '20:00', '21:00'],
        'wednesday': ['19:00', '20:00', '21:00'],
        'thursday': ['19:00', '20:00', '21:00'],
        'friday': ['19:00', '20:00', '21:00'],
        'saturday': ['10:00', '11:00', '14:00', '15:00', '16:00'],
        'sunday': ['10:00', '11:00', '14:00', '15:00', '16:00']
      }),
      languages_spoken: JSON.stringify(['English', 'French', 'Basic Korean']),
      certifications: JSON.stringify(['TEFL']),
      years_experience: 5,
      rating: 4.9,
      total_reviews: 203,
      total_sessions: 1247,
      is_verified: true,
      is_available: true,
      location_city: 'Seoul',
      location_region: 'Hongdae'
    },
    {
      user_id: 3,
      specialty: 'IELTS/TOEFL Preparation',
      bio: 'IELTS and TOEFL preparation specialist with proven track record of helping students achieve their target scores. Over 300 students have successfully passed their exams with my guidance.',
      hourly_rate: 55.00,
      available_times: JSON.stringify({
        'monday': ['18:00', '19:00', '20:00'],
        'tuesday': ['18:00', '19:00', '20:00'],
        'wednesday': ['18:00', '19:00', '20:00'],
        'thursday': ['18:00', '19:00', '20:00'],
        'saturday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        'sunday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      }),
      languages_spoken: JSON.stringify(['English', 'Korean', 'Chinese']),
      certifications: JSON.stringify(['IELTS Certified Trainer', 'TOEFL iBT Specialist', 'Cambridge CELTA']),
      years_experience: 12,
      rating: 4.7,
      total_reviews: 89,
      total_sessions: 543,
      is_verified: true,
      is_available: true,
      location_city: 'Seoul',
      location_region: 'Jongno-gu'
    },
    {
      user_id: 4,
      specialty: 'Academic Writing',
      bio: 'PhD in Applied Linguistics with extensive experience in academic writing instruction. Help students with essays, research papers, and thesis writing for university applications and coursework.',
      hourly_rate: 60.00,
      available_times: JSON.stringify({
        'tuesday': ['14:00', '15:00', '16:00', '17:00'],
        'thursday': ['14:00', '15:00', '16:00', '17:00'],
        'saturday': ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
      }),
      languages_spoken: JSON.stringify(['English', 'Korean']),
      certifications: JSON.stringify(['PhD Applied Linguistics', 'Academic Writing Specialist']),
      years_experience: 15,
      rating: 4.6,
      total_reviews: 67,
      total_sessions: 234,
      is_verified: true,
      is_available: true,
      location_city: 'Seoul',
      location_region: 'Seocho-gu'
    },
    {
      user_id: 5,
      specialty: 'Pronunciation & Accent',
      bio: 'Speech therapist turned English tutor specializing in pronunciation improvement and accent reduction. Using scientific methods to help students speak more clearly and confidently.',
      hourly_rate: 50.00,
      available_times: JSON.stringify({
        'monday': ['10:00', '11:00', '15:00', '16:00'],
        'wednesday': ['10:00', '11:00', '15:00', '16:00'],
        'friday': ['10:00', '11:00', '15:00', '16:00'],
        'saturday': ['09:00', '10:00', '11:00', '13:00', '14:00']
      }),
      languages_spoken: JSON.stringify(['English', 'Spanish', 'Korean']),
      certifications: JSON.stringify(['Speech Therapy License', 'Pronunciation Specialist']),
      years_experience: 10,
      rating: 4.9,
      total_reviews: 134,
      total_sessions: 678,
      is_verified: true,
      is_available: true,
      location_city: 'Seoul',
      location_region: 'Mapo-gu'
    }
  ]);
};