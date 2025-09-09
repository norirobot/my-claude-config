import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

// 상황별 학습 테이블 초기화
export function initSituationsTables() {
  console.log('📋 Initializing situations tables...');

  // 상황별 학습 시나리오 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS situations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      name_ko VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      difficulty_level INTEGER DEFAULT 1,
      description TEXT,
      icon VARCHAR(50),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 각 상황별 대화 템플릿
  db.exec(`
    CREATE TABLE IF NOT EXISTS situation_dialogues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      situation_id INTEGER NOT NULL,
      sequence_order INTEGER NOT NULL,
      speaker VARCHAR(20) NOT NULL,
      content TEXT,
      hint_level_1 TEXT,
      hint_level_2 TEXT,
      hint_level_3 TEXT,
      expected_response TEXT,
      alternative_responses TEXT,
      grammar_points TEXT,
      vocabulary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (situation_id) REFERENCES situations(id)
    )
  `);

  // 사용자별 상황 학습 진도
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_situation_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      situation_id INTEGER NOT NULL,
      mastery_level INTEGER DEFAULT 0,
      practice_count INTEGER DEFAULT 0,
      last_practice_date DATETIME,
      next_review_date DATETIME,
      interval_days INTEGER DEFAULT 1,
      ease_factor REAL DEFAULT 2.5,
      hint_level_current INTEGER DEFAULT 1,
      mistakes_json TEXT,
      last_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (situation_id) REFERENCES situations(id),
      UNIQUE(user_id, situation_id)
    )
  `);

  // 인덱스 추가
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_progress 
    ON user_situation_progress(user_id, situation_id);
    
    CREATE INDEX IF NOT EXISTS idx_next_review 
    ON user_situation_progress(next_review_date);
    
    CREATE INDEX IF NOT EXISTS idx_situation_category 
    ON situations(category, is_active);
  `);

  // 음성 분석 세션 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS voice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      situation_id INTEGER,
      dialogue_id INTEGER,
      expected_text TEXT NOT NULL,
      transcription TEXT,
      pronunciation_score INTEGER DEFAULT 0,
      accuracy_score INTEGER DEFAULT 0,
      fluency_score INTEGER DEFAULT 0,
      completeness_score INTEGER DEFAULT 0,
      analysis_result TEXT, -- JSON 형태로 전체 분석 결과 저장
      word_scores_json TEXT, -- 단어별 점수 JSON
      phoneme_errors_json TEXT, -- 음소 오류 JSON
      timing_analysis_json TEXT, -- 타이밍 분석 JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (situation_id) REFERENCES situations(id),
      FOREIGN KEY (dialogue_id) REFERENCES situation_dialogues(id)
    )
  `);

  // 인덱스 추가
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_voice_user_date 
    ON voice_sessions(user_id, created_at);
    
    CREATE INDEX IF NOT EXISTS idx_voice_situation 
    ON voice_sessions(situation_id, created_at);
    
    CREATE INDEX IF NOT EXISTS idx_voice_scores 
    ON voice_sessions(pronunciation_score, accuracy_score);
  `);

  console.log('✅ Situations tables initialized');
}

// 시드 데이터 실행
export function seedSituationsData() {
  console.log('🌱 Seeding situations data...');

  // 기본 상황들 추가
  const situations = [
    {
      name: 'Ordering Coffee',
      name_ko: '커피 주문하기',
      category: 'daily',
      difficulty_level: 1,
      description: 'Practice ordering drinks at a coffee shop',
      icon: '☕'
    },
    {
      name: 'Restaurant Dining',
      name_ko: '레스토랑에서 식사',
      category: 'daily',
      difficulty_level: 2,
      description: 'Order food and interact with waiters',
      icon: '🍽️'
    },
    {
      name: 'Shopping for Clothes',
      name_ko: '옷 쇼핑하기',
      category: 'daily',
      difficulty_level: 2,
      description: 'Ask about sizes, colors, and prices',
      icon: '👔'
    },
    {
      name: 'Airport Check-in',
      name_ko: '공항 체크인',
      category: 'travel',
      difficulty_level: 3,
      description: 'Check in for a flight and handle luggage',
      icon: '✈️'
    },
    {
      name: 'Job Interview',
      name_ko: '면접',
      category: 'business',
      difficulty_level: 4,
      description: 'Answer common interview questions',
      icon: '💼'
    }
  ];

  const insertSituation = db.prepare(`
    INSERT OR IGNORE INTO situations (name, name_ko, category, difficulty_level, description, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const situation of situations) {
    const result = insertSituation.run(
      situation.name,
      situation.name_ko,
      situation.category,
      situation.difficulty_level,
      situation.description,
      situation.icon
    );

    // 커피숍 대화 시나리오 추가
    if (situation.name === 'Ordering Coffee' && result.lastInsertRowid) {
      seedCoffeeShopDialogues(result.lastInsertRowid as number);
    }
    // 레스토랑 대화 시나리오 추가
    else if (situation.name === 'Restaurant Dining' && result.lastInsertRowid) {
      seedRestaurantDialogues(result.lastInsertRowid as number);
    }
  }

  console.log('✅ Situations data seeded');
}

function seedCoffeeShopDialogues(situationId: number) {
  const dialogues = [
    {
      sequence_order: 1,
      speaker: 'tutor',
      content: 'Hi! Welcome to our coffee shop. What can I get for you today?',
      expected_response: null,
      hint_level_1: null,
      hint_level_2: null,
      hint_level_3: null
    },
    {
      sequence_order: 2,
      speaker: 'student',
      content: null,
      expected_response: 'I would like a large cappuccino, please.',
      hint_level_1: 'I would like a large cappuccino, please.',
      hint_level_2: 'I would like... large... cappuccino',
      hint_level_3: 'I would...',
      alternative_responses: JSON.stringify([
        'Can I have a large cappuccino?',
        'A large cappuccino, please.',
        'I\'ll have a large cappuccino.'
      ]),
      grammar_points: JSON.stringify({
        patterns: ['I would like...', 'Can I have...', 'I\'ll have...'],
        tips: 'Use polite forms when ordering'
      }),
      vocabulary: JSON.stringify(['cappuccino', 'large', 'please'])
    },
    {
      sequence_order: 3,
      speaker: 'tutor',
      content: 'Would you like it for here or to go?',
      expected_response: null
    },
    {
      sequence_order: 4,
      speaker: 'student',
      content: null,
      expected_response: 'For here, please.',
      hint_level_1: 'For here, please.',
      hint_level_2: 'For here...',
      hint_level_3: 'For...',
      alternative_responses: JSON.stringify([
        'I\'ll have it here.',
        'For here.',
        'To stay, please.'
      ])
    }
  ];

  const insertDialogue = db.prepare(`
    INSERT INTO situation_dialogues (
      situation_id, sequence_order, speaker, content, 
      expected_response, hint_level_1, hint_level_2, hint_level_3,
      alternative_responses, grammar_points, vocabulary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const dialogue of dialogues) {
    insertDialogue.run(
      situationId,
      dialogue.sequence_order,
      dialogue.speaker,
      dialogue.content,
      dialogue.expected_response,
      dialogue.hint_level_1,
      dialogue.hint_level_2,
      dialogue.hint_level_3,
      dialogue.alternative_responses || null,
      dialogue.grammar_points || null,
      dialogue.vocabulary || null
    );
  }
}

function seedRestaurantDialogues(situationId: number) {
  const dialogues = [
    {
      sequence_order: 1,
      speaker: 'tutor',
      content: 'Good evening! Do you have a reservation?',
      expected_response: null
    },
    {
      sequence_order: 2,
      speaker: 'student',
      content: null,
      expected_response: 'No, we don\'t. Do you have a table for two?',
      hint_level_1: 'No, we don\'t. Do you have a table for two?',
      hint_level_2: 'No... table... two',
      hint_level_3: 'No, we...',
      alternative_responses: JSON.stringify([
        'No reservation. Table for two, please.',
        'We don\'t have a reservation. Is there a table available?'
      ])
    }
  ];

  const insertDialogue = db.prepare(`
    INSERT INTO situation_dialogues (
      situation_id, sequence_order, speaker, content, 
      expected_response, hint_level_1, hint_level_2, hint_level_3,
      alternative_responses, grammar_points, vocabulary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const dialogue of dialogues) {
    insertDialogue.run(
      situationId,
      dialogue.sequence_order,
      dialogue.speaker,
      dialogue.content,
      dialogue.expected_response,
      dialogue.hint_level_1,
      dialogue.hint_level_2,
      dialogue.hint_level_3,
      dialogue.alternative_responses || null,
      dialogue.grammar_points || null,
      dialogue.vocabulary || null
    );
  }
}