const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('📚 1차시 기초문제를 더 추가합니다...\n');

// 1차시 추가 문제들
const additionalProblems = [
  {
    title: '내 이름 출력하기',
    description: '자신의 이름을 화면에 출력하는 프로그램을 작성하세요. (예: "홍길동")',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: '홍길동',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 자신의 이름을 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("홍길동");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 자신의 실제 이름으로 바꿔서 출력하세요\n3. 따옴표 안에 이름을 작성하세요',
    isActive: 1
  },
  {
    title: '숫자 하나 출력하기',
    description: '숫자 100을 화면에 출력하는 프로그램을 작성하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: '100',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 숫자 100을 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("100");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 숫자도 따옴표 안에 넣으면 문자열로 출력됩니다\n3. 세미콜론을 잊지 마세요',
    isActive: 1
  },
  {
    title: '별표 하나 출력하기',
    description: '별표(*)를 하나 화면에 출력하는 프로그램을 작성하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: '*',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 별표를 하나 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("*");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 별표(*)는 특별한 기호가 아니라 일반 문자입니다',
    isActive: 1
  },
  {
    title: '학교 이름 출력하기',
    description: '"코딩학원"을 화면에 출력하는 프로그램을 작성하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: '코딩학원',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // "코딩학원"을 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("코딩학원");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 한글도 문자열로 출력할 수 있습니다',
    isActive: 1
  },
  {
    title: '두 단어 출력하기',
    description: '"C언어"와 "프로그래밍"을 공백으로 구분하여 한 줄에 출력하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: 'C언어 프로그래밍',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // "C언어 프로그래밍"을 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("C언어 프로그래밍");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 공백도 따옴표 안에 함께 넣으세요\n3. 하나의 printf로 전체를 출력할 수 있습니다',
    isActive: 1
  },
  {
    title: '간단한 문장 출력하기',
    description: '"오늘은 좋은 날이다"를 화면에 출력하는 프로그램을 작성하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: '오늘은 좋은 날이다',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // "오늘은 좋은 날이다"를 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("오늘은 좋은 날이다");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 긴 문장도 따옴표 안에 그대로 작성하면 됩니다',
    isActive: 1
  }
];

db.serialize(() => {
  console.log('🔧 1차시 추가 문제 삽입 시작...\n');

  let completed = 0;
  const total = additionalProblems.length;

  additionalProblems.forEach((problem, index) => {
    const sql = `INSERT INTO problems (
      title, description, language, difficulty, category, lesson, 
      inputExample, outputExample, starterCode, solution, hints, isActive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      problem.title,
      problem.description,
      problem.language,
      problem.difficulty,
      problem.category,
      problem.lesson,
      problem.inputExample,
      problem.outputExample,
      problem.starterCode,
      problem.solution,
      problem.hints,
      problem.isActive
    ];

    db.run(sql, params, function(err) {
      completed++;
      if (err) {
        console.error(`❌ 문제 "${problem.title}" 추가 실패:`, err.message);
      } else {
        console.log(`✅ ${completed}/${total} "${problem.title}" 추가됨 (ID: ${this.lastID})`);
      }

      // 모든 문제 추가 완료 시
      if (completed === total) {
        console.log(`\n🎉 1차시 추가 문제 ${total}개가 성공적으로 추가되었습니다!`);
        console.log('\n📖 현재 1차시 문제 구성 (총 8개):');
        console.log('   1. Hello World 출력하기');
        console.log('   2. 간단한 인사말 출력');
        console.log('   3. 내 이름 출력하기 ← NEW');
        console.log('   4. 숫자 하나 출력하기 ← NEW');
        console.log('   5. 별표 하나 출력하기 ← NEW');
        console.log('   6. 학교 이름 출력하기 ← NEW');
        console.log('   7. 두 단어 출력하기 ← NEW');
        console.log('   8. 간단한 문장 출력하기 ← NEW');
        console.log('\n🚀 이제 1차시에 충분한 연습 문제가 있습니다!');

        // 데이터베이스 연결 종료
        db.close((err) => {
          if (err) {
            console.error('데이터베이스 연결 종료 오류:', err.message);
          } else {
            console.log('데이터베이스 연결이 종료되었습니다.');
          }
        });
      }
    });
  });
});
