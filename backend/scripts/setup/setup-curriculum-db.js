const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// 커리큘럼 관련 테이블 생성
db.serialize(() => {
  // 단원(Units) 테이블
  db.run(`CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 차시(Lessons) 테이블
  db.run(`CREATE TABLE IF NOT EXISTS curriculum_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units (id)
  )`);

  // 단계(Steps) 테이블
  db.run(`CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    starter_code TEXT,
    solution_code TEXT,
    hint TEXT,
    order_index INTEGER NOT NULL,
    step_type TEXT DEFAULT 'coding', -- coding, quiz, assessment
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES curriculum_lessons (id)
  )`);

  // 학생 진도 테이블
  db.run(`CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    step_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (step_id) REFERENCES steps (id),
    UNIQUE(student_id, step_id)
  )`);

  // 단원 평가 테이블
  db.run(`CREATE TABLE IF NOT EXISTS unit_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    questions TEXT NOT NULL, -- JSON format
    passing_score INTEGER DEFAULT 80,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units (id)
  )`);

  // 학생 평가 결과 테이블
  db.run(`CREATE TABLE IF NOT EXISTS student_assessment_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    assessment_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    answers TEXT NOT NULL, -- JSON format
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (assessment_id) REFERENCES unit_assessments (id),
    UNIQUE(student_id, assessment_id)
  )`);

  console.log('✅ 커리큘럼 데이터베이스 테이블 생성 완료!');

  // 샘플 데이터 삽입
  console.log('📚 샘플 커리큘럼 데이터 삽입 중...');

  // 1단원: 기초 출력
  db.run(`INSERT OR IGNORE INTO units (id, title, description, order_index) VALUES 
    (1, '기초 출력', 'C언어의 printf 함수를 배우고 기본적인 출력을 연습합니다.', 1)`);

  db.run(`INSERT OR IGNORE INTO curriculum_lessons (id, unit_id, title, description, order_index) VALUES 
    (1, 1, '첫 번째 프로그램', 'Hello World를 출력하는 프로그램을 만들어봅시다.', 1),
    (2, 1, '이름 출력하기', '자신의 이름을 출력하는 프로그램을 작성합니다.', 2)`);

  db.run(`INSERT OR IGNORE INTO steps (id, lesson_id, title, description, instructions, starter_code, solution_code, hint, order_index, step_type) VALUES 
    (1, 1, 'Hello World 출력', 'printf 함수를 사용해서 "Hello, World!"를 출력해보세요.', 
     '블록을 드래그해서 Hello World를 출력하는 프로그램을 완성하세요.', 
     '#include <stdio.h>\n\nint main() {\n    // 여기에 printf 블록을 넣으세요\n    return 0;\n}',
     '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',
     'printf 블록을 main 함수 안에 넣고, 텍스트 블록에 "Hello, World!"를 입력하세요.', 1, 'coding'),
    
    (2, 1, '줄바꿈 출력', 'printf 함수에 \\n을 사용해서 줄바꿈을 해보세요.',
     '두 줄에 걸쳐서 메시지를 출력해보세요.',
     '#include <stdio.h>\n\nint main() {\n    // 첫 번째 줄을 출력하세요\n    // 두 번째 줄을 출력하세요\n    return 0;\n}',
     '#include <stdio.h>\n\nint main() {\n    printf("첫 번째 줄\\n");\n    printf("두 번째 줄\\n");\n    return 0;\n}',
     '텍스트 끝에 \\n을 넣으면 줄바꿈이 됩니다.', 2, 'coding')`);

  // 2단원: 변수와 연산
  db.run(`INSERT OR IGNORE INTO units (id, title, description, order_index) VALUES 
    (2, '변수와 연산', '변수를 선언하고 사용하는 방법을 배웁니다.', 2)`);

  db.run(`INSERT OR IGNORE INTO curriculum_lessons (id, unit_id, title, description, order_index) VALUES 
    (3, 2, '정수 변수', '정수 변수를 선언하고 사용해봅시다.', 1)`);

  db.run(`INSERT OR IGNORE INTO steps (id, lesson_id, title, description, instructions, starter_code, solution_code, hint, order_index, step_type) VALUES 
    (3, 3, '변수 선언하기', 'int 타입의 변수를 선언하고 값을 할당해보세요.',
     '변수 선언 블록을 사용해서 정수 변수를 만들어보세요.',
     '#include <stdio.h>\n\nint main() {\n    // 여기에 변수를 선언하세요\n    return 0;\n}',
     '#include <stdio.h>\n\nint main() {\n    int number = 10;\n    printf("%d", number);\n    return 0;\n}',
     '변수 선언 블록에서 타입을 int로, 이름을 정하고 값을 입력하세요.', 1, 'coding')`);

  // 단원 평가 샘플
  db.run(`INSERT OR IGNORE INTO unit_assessments (id, unit_id, title, questions, passing_score) VALUES 
    (1, 1, '기초 출력 평가', 
     '[{"question": "printf 함수의 역할은?", "type": "multiple", "options": ["입력", "출력", "계산", "저장"], "answer": 1}]', 
     80)`);

  console.log('✅ 샘플 데이터 삽입 완료!');
});

db.close();
