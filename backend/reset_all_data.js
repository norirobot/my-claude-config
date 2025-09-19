const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔄 데이터베이스 전체 초기화 시작...');

db.serialize(() => {
  // 모든 기존 데이터 삭제
  db.run('DELETE FROM users WHERE role = "student"', (err) => {
    if (err) console.log('학생 데이터 삭제:', err.message);
    else console.log('✅ 기존 학생 데이터 삭제 완료');
  });

  db.run('DELETE FROM problems', (err) => {
    if (err) console.log('문제 데이터 삭제:', err.message);
    else console.log('✅ 기존 문제 데이터 삭제 완료');
  });

  db.run('DELETE FROM submissions', (err) => {
    if (err) console.log('제출 데이터 삭제:', err.message);
    else console.log('✅ 기존 제출 데이터 삭제 완료');
  });

  // 테스트용 학생 계정 추가
  const students = [
    ['student1', '1234', '김철수'],
    ['student2', '1234', '이영희'],  
    ['student3', '1234', '박민수'],
    ['student4', '1234', '최지혜'],
    ['student5', '1234', '정우진'],
    ['student6', '1234', '서현준']
  ];

  console.log('📝 테스트 학생 계정 생성 중...');
  students.forEach(([username, password, name], index) => {
    db.run(`INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)`,
      [username, password, name, 'student'], 
      function(err) {
        if (err) {
          console.error(`${name} 계정 생성 실패:`, err.message);
        } else {
          console.log(`✅ ${name} (${username}) 계정 생성 완료`);
        }
      });
  });

  // 기본 문제들 추가
  const problems = [
    {
      title: 'Hello World',
      description: '"Hello World"를 출력하는 프로그램을 작성하세요.',
      lesson: 1,
      expectedOutput: 'Hello World',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '변수와 출력',
      description: '정수 변수에 값을 저장하고 출력하는 프로그램을 작성하세요.',
      lesson: 2,
      expectedOutput: '42',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '사칙연산',
      description: '두 정수 10과 3의 합, 차, 곱, 나눈 몫을 각각 출력하세요.',
      lesson: 3,
      expectedOutput: '13\n7\n30\n3',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    }
  ];

  console.log('📚 기본 문제 데이터 추가 중...');
  problems.forEach((problem, index) => {
    db.run(`INSERT INTO problems (title, description, lesson, expectedOutput, starterCode, language, difficulty, category, isActive) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [problem.title, problem.description, problem.lesson, problem.expectedOutput, 
       problem.starterCode, 'c', 'beginner', 'basic', 1], 
      function(err) {
        if (err) {
          console.error(`문제 ${index + 1} 생성 실패:`, err.message);
        } else {
          console.log(`✅ 문제 ${index + 1}: ${problem.title} 생성 완료`);
        }
        
        if (index === problems.length - 1) {
          console.log('\n🎉 전체 데이터 초기화 완료!');
          console.log('📋 생성된 계정 정보:');
          console.log('관리자: admin / admin123');
          students.forEach(([username, password, name]) => {
            console.log(`학생: ${username} / ${password} (${name})`);
          });
          db.close();
        }
      });
  });
});