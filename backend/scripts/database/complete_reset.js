const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// 기존 데이터베이스 파일 완전 삭제
if (fs.existsSync('./database.db')) {
  fs.unlinkSync('./database.db');
  console.log('✅ 기존 데이터베이스 파일 삭제 완료');
}

const db = new sqlite3.Database('./database.db');

console.log('🔄 완전 새로운 데이터베이스 생성 중...');

db.serialize(() => {
  // users 테이블 생성
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('users 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ users 테이블 생성 완료');
    }
  });

  // problems 테이블 생성
  db.run(`CREATE TABLE problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    lesson INTEGER,
    expectedOutput TEXT,
    starterCode TEXT,
    language TEXT DEFAULT 'c',
    difficulty TEXT DEFAULT 'beginner',
    category TEXT DEFAULT 'basic',
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('problems 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ problems 테이블 생성 완료');
    }
  });

  // 관리자 계정 생성
  db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin123', '관리자', 'teacher'],
    function(err) {
      if (err) {
        console.error('관리자 계정 생성 실패:', err.message);
      } else {
        console.log('✅ 관리자 계정 생성 완료');
      }
    });

  // 정확히 5명의 학생만 생성
  const students = [
    ['student1', '1234', '김학생'],
    ['student2', '1234', '이학생'],
    ['student3', '1234', '박학생'],
    ['student4', '1234', '서현준'],
    ['student5', '1234', '김철수']
  ];

  console.log('👥 5명의 학생 계정 생성 중...');
  students.forEach(([username, password, name], index) => {
    db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, password, name, 'student'],
      function(err) {
        if (err) {
          console.error(`${name} 계정 생성 실패:`, err.message);
        } else {
          console.log(`✅ ${name} (${username}) 계정 생성 완료`);
        }
      });
  });

  // 문제 데이터 추가
  const problems = [
    // 1차시
    { title: 'Hello World', description: '"Hello World"를 출력하는 프로그램을 작성하세요.', lesson: 1, expectedOutput: 'Hello World', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },
    { title: '내 이름 출력하기', description: '자신의 이름을 출력하는 프로그램을 작성하세요.', lesson: 1, expectedOutput: '홍길동', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },
    { title: '간단한 인사', description: '"안녕하세요!"를 출력하는 프로그램을 작성하세요.', lesson: 1, expectedOutput: '안녕하세요!', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },

    // 2차시
    { title: '정수 변수 출력', description: '정수 변수에 42를 저장하고 출력하는 프로그램을 작성하세요.', lesson: 2, expectedOutput: '42', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },
    { title: '문자 변수 출력', description: '문자 변수에 \'A\'를 저장하고 출력하는 프로그램을 작성하세요.', lesson: 2, expectedOutput: 'A', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },
    { title: '실수 변수 출력', description: '실수 변수에 3.14를 저장하고 출력하는 프로그램을 작성하세요.', lesson: 2, expectedOutput: '3.140000', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },

    // 3차시
    { title: '덧셈 계산', description: '10과 20을 더한 결과를 출력하세요.', lesson: 3, expectedOutput: '30', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },
    { title: '뺄셈 계산', description: '100에서 30을 뺀 결과를 출력하세요.', lesson: 3, expectedOutput: '70', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' },
    { title: '곱셈 계산', description: '5와 6을 곱한 결과를 출력하세요.', lesson: 3, expectedOutput: '30', starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}' }
  ];

  problems.forEach((problem, index) => {
    setTimeout(() => {
      db.run(`INSERT INTO problems (title, description, lesson, expectedOutput, starterCode, language, difficulty, category, isActive) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [problem.title, problem.description, problem.lesson, problem.expectedOutput,
        problem.starterCode, 'c', 'beginner', 'basic', 1],
      function(err) {
        if (err) {
          console.error('문제 생성 실패:', err.message);
        } else {
          console.log(`✅ [${problem.lesson}차시] ${problem.title} 생성 완료`);
        }

        if (index === problems.length - 1) {
          console.log('\n🎉 완전 초기화 완료!');
          console.log('📋 학생 5명 + 관리자 1명 + 문제 9개');
          db.close();
        }
      });
    }, index * 50);
  });
});
