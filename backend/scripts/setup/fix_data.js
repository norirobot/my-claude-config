const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔄 학생 이름 수정 및 문제 추가 시작...');

// 정확한 학생 이름들
const correctNames = [
  ['student1', '김학생'],
  ['student2', '이학생'],
  ['student3', '박학생'],
  ['student4', '서현준'],
  ['student5', '김철수'],
  ['student6', '이영희'],
  ['student7', '박민수'],
  ['student8', '최지혜'],
  ['student9', '정우진']
];

db.serialize(() => {
  // 1. 학생 이름 수정
  console.log('👥 학생 이름 수정 중...');
  correctNames.forEach(([username, name]) => {
    db.run('UPDATE users SET name = ? WHERE username = ?', [name, username], function(err) {
      if (err) {
        console.error(`${username} 이름 수정 실패:`, err.message);
      } else {
        console.log(`✅ ${username} → ${name} 수정 완료`);
      }
    });
  });

  // 2. 기존 문제 삭제
  db.run('DELETE FROM problems', (err) => {
    if (err) {
      console.error('기존 문제 삭제 실패:', err.message);
    } else {
      console.log('✅ 기존 문제 삭제 완료');
    }
  });

  // 3. 각 차시별로 3문제씩 추가
  const problems = [
    // 1차시 - 3문제
    {
      title: 'Hello World',
      description: '"Hello World"를 출력하는 프로그램을 작성하세요.',
      lesson: 1,
      expectedOutput: 'Hello World',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '내 이름 출력하기',
      description: '자신의 이름을 출력하는 프로그램을 작성하세요.',
      lesson: 1,
      expectedOutput: '홍길동',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '간단한 인사',
      description: '"안녕하세요!"를 출력하는 프로그램을 작성하세요.',
      lesson: 1,
      expectedOutput: '안녕하세요!',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    
    // 2차시 - 3문제
    {
      title: '정수 변수 출력',
      description: '정수 변수에 42를 저장하고 출력하는 프로그램을 작성하세요.',
      lesson: 2,
      expectedOutput: '42',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '문자 변수 출력',
      description: '문자 변수에 \'A\'를 저장하고 출력하는 프로그램을 작성하세요.',
      lesson: 2,
      expectedOutput: 'A',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '실수 변수 출력',
      description: '실수 변수에 3.14를 저장하고 출력하는 프로그램을 작성하세요.',
      lesson: 2,
      expectedOutput: '3.140000',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    
    // 3차시 - 3문제
    {
      title: '덧셈 계산',
      description: '10과 20을 더한 결과를 출력하세요.',
      lesson: 3,
      expectedOutput: '30',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '뺄셈 계산',
      description: '100에서 30을 뺀 결과를 출력하세요.',
      lesson: 3,
      expectedOutput: '70',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    },
    {
      title: '곱셈 계산',
      description: '5와 6을 곱한 결과를 출력하세요.',
      lesson: 3,
      expectedOutput: '30',
      starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
    }
  ];

  console.log('📚 각 차시별 3문제씩 추가 중...');
  problems.forEach((problem, index) => {
    setTimeout(() => {
      db.run(`INSERT INTO problems (title, description, lesson, expectedOutput, starterCode, language, difficulty, category, isActive) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [problem.title, problem.description, problem.lesson, problem.expectedOutput, 
         problem.starterCode, 'c', 'beginner', 'basic', 1], 
        function(err) {
          if (err) {
            console.error(`문제 ${index + 1} 생성 실패:`, err.message);
          } else {
            console.log(`✅ [${problem.lesson}차시] ${problem.title} 생성 완료`);
          }
          
          if (index === problems.length - 1) {
            console.log('\n🎉 모든 데이터 수정 완료!');
            console.log('✅ 9명의 학생 이름 수정 완료');
            console.log('✅ 3차시 × 3문제 = 총 9개 문제 생성 완료');
            db.close();
          }
        });
    }, index * 100); // 순차적으로 실행
  });
});