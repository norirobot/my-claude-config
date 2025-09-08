import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const dbPath = path.join(__dirname, '../../data/tutor.db');

let db: sqlite3.Database | null = null;

export async function initDatabase(): Promise<void> {
  try {
    // data 디렉토리 생성
    const dataDir = path.dirname(dbPath);
    await fs.mkdir(dataDir, { recursive: true });

    // 데이터베이스 연결
    db = new sqlite3.Database(dbPath);
    
    // 테이블 생성
    await createTables();
    await seedInitialData();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not connected');

  const run = promisify(db.run.bind(db));

  // 사용자 테이블
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      avatar_url VARCHAR(500),
      level INTEGER DEFAULT 1,
      experience_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 튜터 테이블
  await run(`
    CREATE TABLE IF NOT EXISTS tutors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      specialties TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      hourly_rate REAL NOT NULL,
      bio TEXT,
      avatar_url VARCHAR(500),
      languages TEXT NOT NULL,
      availability TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 예약 테이블
  await run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tutor_id INTEGER NOT NULL,
      scheduled_at DATETIME NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      status VARCHAR(20) DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
    )
  `);

  // AI 채팅 세션 테이블
  await run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ai_tutor VARCHAR(50) DEFAULT 'Jennifer',
      topic VARCHAR(200),
      message_count INTEGER DEFAULT 0,
      session_score REAL DEFAULT 0,
      session_duration INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 채팅 메시지 테이블
  await run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      sender VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      evaluation_score REAL,
      feedback TEXT,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    )
  `);

  // 학습 진도 테이블
  await run(`
    CREATE TABLE IF NOT EXISTS learning_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_sessions INTEGER DEFAULT 0,
      total_study_hours REAL DEFAULT 0,
      avg_session_score REAL DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_study_date DATE,
      achievements TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ All database tables created');
}

async function seedInitialData(): Promise<void> {
  if (!db) throw new Error('Database not connected');

  const get = promisify(db.get.bind(db));
  const run = promisify(db.run.bind(db));

  // 샘플 튜터 데이터 확인
  const existingTutor = await get('SELECT id FROM tutors LIMIT 1');
  
  if (!existingTutor) {
    // 샘플 튜터 데이터 추가
    const sampleTutors = [
      {
        name: 'Sarah Johnson',
        specialties: 'Business English,Conversation,IELTS',
        rating: 4.9,
        hourly_rate: 25.00,
        bio: 'Native English speaker with 5 years of teaching experience. Specialized in business English and IELTS preparation.',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b667331f?w=150&h=150&fit=crop&crop=face',
        languages: 'English,Korean',
        availability: 'Mon-Fri 9AM-6PM KST'
      },
      {
        name: 'David Miller',
        specialties: 'Grammar,Writing,Academic English',
        rating: 4.8,
        hourly_rate: 22.00,
        bio: 'PhD in English Literature. Helping students improve their academic writing and grammar skills.',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        languages: 'English',
        availability: 'Tue-Thu 2PM-10PM KST'
      },
      {
        name: 'Emma Thompson',
        specialties: 'Pronunciation,Speaking,Accent Training',
        rating: 4.9,
        hourly_rate: 28.00,
        bio: 'Speech therapist and English teacher. Specialized in pronunciation correction and accent training.',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        languages: 'English,Spanish',
        availability: 'Mon-Wed-Fri 7PM-11PM KST'
      }
    ];

    for (const tutor of sampleTutors) {
      await run(`
        INSERT INTO tutors (name, specialties, rating, hourly_rate, bio, avatar_url, languages, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [tutor.name, tutor.specialties, tutor.rating, tutor.hourly_rate, tutor.bio, tutor.avatar_url, tutor.languages, tutor.availability]);
    }

    console.log('✅ Sample tutor data seeded');
  }
}

export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await new Promise<void>((resolve, reject) => {
      db!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    db = null;
    console.log('✅ Database connection closed');
  }
}