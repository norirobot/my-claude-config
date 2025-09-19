const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('📚 새로운 문제 세트를 추가합니다...\n');

// C언어 기초 문제 세트
const problems = [
  // 1차시: 기본 출력
  {
    title: 'Hello World 출력하기',
    description: 'printf() 함수를 사용하여 "Hello World!"를 화면에 출력하는 프로그램을 작성하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: 'Hello World!',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 여기에 코드를 작성하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("Hello World!");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 문자열은 쌍따옴표 안에 작성하세요\n3. 세미콜론(;)을 잊지 마세요',
    isActive: 1
  },
  {
    title: '간단한 인사말 출력',
    description: '"안녕하세요!"를 화면에 출력하는 프로그램을 작성하세요.',
    language: 'c',
    difficulty: 'easy', 
    category: 'basic',
    lesson: 1,
    inputExample: null,
    outputExample: '안녕하세요!',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 여기에 코드를 작성하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("안녕하세요!");\n    return 0;\n}',
    hints: '1. printf() 함수를 사용하세요\n2. 한글도 문자열로 출력할 수 있습니다',
    isActive: 1
  },

  // 2차시: 변수와 출력
  {
    title: '정수 변수 출력하기',
    description: 'int형 변수 두 개를 선언하고 10과 20을 저장한 후, 두 값을 공백으로 구분하여 출력하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 2,
    inputExample: null,
    outputExample: '10 20',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 변수를 선언하고 값을 저장하세요\n    \n    // printf를 사용하여 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    int a = 10;\n    int b = 20;\n    printf("%d %d", a, b);\n    return 0;\n}',
    hints: '1. int 키워드로 변수를 선언하세요\n2. %d를 사용하여 정수를 출력하세요\n3. 공백도 따옴표 안에 넣어야 합니다',
    isActive: 1
  },
  {
    title: '실수 변수 출력하기',
    description: 'float형 변수에 3.14를 저장하고 출력하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 2,
    inputExample: null,
    outputExample: '3.14',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // float 변수를 선언하고 3.14를 저장하세요\n    \n    // 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    float pi = 3.14;\n    printf("%.2f", pi);\n    return 0;\n}',
    hints: '1. float 키워드를 사용하세요\n2. %.2f를 사용하여 소수점 둘째 자리까지 출력하세요',
    isActive: 1
  },

  // 3차시: 간단한 계산
  {
    title: '두 수의 합',
    description: '5와 7을 더한 결과를 출력하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 3,
    inputExample: null,
    outputExample: '12',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 두 수를 더한 결과를 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    int result = 5 + 7;\n    printf("%d", result);\n    return 0;\n}',
    hints: '1. + 연산자를 사용하세요\n2. 계산 결과를 변수에 저장하거나 직접 출력할 수 있습니다',
    isActive: 1
  },
  {
    title: '두 수의 곱',
    description: '6과 8을 곱한 결과를 출력하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 3,
    inputExample: null,
    outputExample: '48',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 두 수를 곱한 결과를 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("%d", 6 * 8);\n    return 0;\n}',
    hints: '1. * 연산자를 사용하세요\n2. 계산을 printf 안에서 직접 할 수도 있습니다',
    isActive: 1
  },

  // 4차시: 줄바꿈과 서식
  {
    title: '여러 줄 출력하기',
    description: '"첫 번째 줄"과 "두 번째 줄"을 각각 다른 줄에 출력하세요.',
    language: 'c',
    difficulty: 'easy',
    category: 'basic',
    lesson: 4,
    inputExample: null,
    outputExample: '첫 번째 줄\\n두 번째 줄',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    // 두 줄에 걸쳐 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    printf("첫 번째 줄\\n두 번째 줄");\n    return 0;\n}',
    hints: '1. \\n을 사용하여 줄바꿈하세요\n2. 하나의 printf로도 여러 줄을 출력할 수 있습니다',
    isActive: 1
  },

  // 5차시: 사용자 입력
  {
    title: '숫자 입력받아 출력하기',
    description: '사용자로부터 정수 하나를 입력받아 그대로 출력하세요.',
    language: 'c',
    difficulty: 'medium',
    category: 'input',
    lesson: 5,
    inputExample: '42',
    outputExample: '42',
    starterCode: '#include <stdio.h>\n\nint main()\n{\n    int num;\n    // 숫자를 입력받으세요\n    \n    // 입력받은 숫자를 출력하세요\n    \n    return 0;\n}',
    solution: '#include <stdio.h>\n\nint main()\n{\n    int num;\n    scanf("%d", &num);\n    printf("%d", num);\n    return 0;\n}',
    hints: '1. scanf() 함수를 사용하여 입력받으세요\n2. &기호를 변수 앞에 붙여야 합니다\n3. %d로 정수를 입력받으세요',
    isActive: 1
  }
];

db.serialize(() => {
  console.log('🔧 문제 추가 시작...\n');
  
  let completed = 0;
  const total = problems.length;
  
  problems.forEach((problem, index) => {
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
        console.log(`\n🎉 총 ${total}개의 문제가 성공적으로 추가되었습니다!`);
        console.log('\n📖 추가된 차시 구성:');
        console.log('   1차시: Hello World, 기본 출력 (2문제)');
        console.log('   2차시: 변수 선언과 출력 (2문제)');
        console.log('   3차시: 간단한 계산 (2문제)');
        console.log('   4차시: 줄바꿈과 서식 (1문제)');
        console.log('   5차시: 사용자 입력 (1문제)');
        console.log('\n🚀 이제 학생들과 함께 테스트할 준비가 되었습니다!');
        
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