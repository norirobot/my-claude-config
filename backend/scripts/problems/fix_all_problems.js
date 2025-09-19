const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 모든 문제 수정 중...\n');

// 완전히 새로운 문제 데이터로 교체
const problems = [
  // 1차시 - 3문제
  {
    id: 1,
    title: 'Hello World',
    description: '"Hello World"를 출력하는 프로그램을 작성하세요.',
    lesson: 1,
    inputExample: '-',
    outputExample: 'Hello World',
    expectedOutput: 'Hello World',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },
  {
    id: 2,
    title: '내 이름 출력하기',
    description: '자신의 이름을 출력하는 프로그램을 작성하세요.',
    lesson: 1,
    inputExample: '-',
    outputExample: '홍길동',
    expectedOutput: '홍길동',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },
  {
    id: 3,
    title: '간단한 인사',
    description: '"안녕하세요!"를 출력하는 프로그램을 작성하세요.',
    lesson: 1,
    inputExample: '-',
    outputExample: '안녕하세요!',
    expectedOutput: '안녕하세요!',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },

  // 2차시 - 3문제
  {
    id: 4,
    title: '정수 변수 출력',
    description: '정수 변수에 42를 저장하고 출력하는 프로그램을 작성하세요.',
    lesson: 2,
    inputExample: '-',
    outputExample: '42',
    expectedOutput: '42',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },
  {
    id: 5,
    title: '문자 변수 출력',
    description: '문자 변수에 \'A\'를 저장하고 출력하는 프로그램을 작성하세요.',
    lesson: 2,
    inputExample: '-',
    outputExample: 'A',
    expectedOutput: 'A',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },
  {
    id: 6,
    title: '실수 변수 출력',
    description: '실수 변수에 3.14를 저장하고 출력하는 프로그램을 작성하세요.',
    lesson: 2,
    inputExample: '-',
    outputExample: '3.140000',
    expectedOutput: '3.140000',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },

  // 3차시 - 3문제
  {
    id: 7,
    title: '덧셈 계산',
    description: '10과 20을 더한 결과를 출력하세요.',
    lesson: 3,
    inputExample: '-',
    outputExample: '30',
    expectedOutput: '30',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },
  {
    id: 8,
    title: '뺄셈 계산',
    description: '100에서 30을 뺀 결과를 출력하세요.',
    lesson: 3,
    inputExample: '-',
    outputExample: '70',
    expectedOutput: '70',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  },
  {
    id: 9,
    title: '곱셈 계산',
    description: '5와 6을 곱한 결과를 출력하세요.',
    lesson: 3,
    inputExample: '-',
    outputExample: '30',
    expectedOutput: '30',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}'
  }
];

db.serialize(() => {
  // 기존 문제들 모두 삭제
  db.run('DELETE FROM problems', (err) => {
    if (err) {
      console.error('기존 문제 삭제 실패:', err.message);
    } else {
      console.log('✅ 기존 문제 삭제 완료');
    }
  });

  // 새로운 문제들 추가
  console.log('📚 새로운 문제 데이터 추가 중...\n');

  problems.forEach((problem, index) => {
    setTimeout(() => {
      db.run(`INSERT INTO problems (id, title, description, lesson, inputExample, outputExample, expectedOutput, starterCode, language, difficulty, category, isActive) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [problem.id, problem.title, problem.description, problem.lesson,
        problem.inputExample, problem.outputExample, problem.expectedOutput, problem.starterCode,
        'c', 'beginner', 'basic', 1],
      function(err) {
        if (err) {
          console.error(`문제 ${problem.id} 생성 실패:`, err.message);
        } else {
          console.log(`✅ [${problem.lesson}차시] ${problem.title} 생성 완료`);
        }

        if (index === problems.length - 1) {
          console.log('\n🎉 모든 문제 수정 완료!');
          console.log('✅ 3차시 × 3문제 = 총 9개 문제');
          console.log('✅ 모든 문제에 입력예시/출력예시 추가');
          console.log('✅ 모든 문제에 플레이스홀더 주석 포함');
          db.close();
        }
      });
    }, index * 100);
  });
});
