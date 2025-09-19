const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Hello World! 출력하기 문제 추가
db.run(`
  INSERT INTO problems (
    title, description, language, difficulty, category, lesson,
    expectedOutput, starterCode, solution, hints, createdAt, updatedAt,
    isActive, inputExample, outputExample
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?)
`, [
  'Hello World! 출력하기',
  'Hello World!를 출력하는 프로그램을 작성하시오.',
  'c',
  'easy',
  '기초',
  1,
  'Hello World!',
  '#include <stdio.h>\n\nint main()\n{\n    \n    return 0;\n}',
  '#include <stdio.h>\n\nint main()\n{\n    printf("Hello World!");\n    return 0;\n}',
  '1. #include <stdio.h>를 사용하세요\n2. printf() 함수를 사용하세요\n3. 문자열은 쌍따옴표로 감싸주세요',
  1,
  '-',
  'Hello World!'
], function(err) {
  if (err) {
    console.error('❌ 문제 추가 실패:', err);
  } else {
    console.log(`✅ 문제 추가 완료: "Hello World! 출력하기" (ID: ${this.lastID})`);
    console.log('📋 문제 내용:');
    console.log('   - 제목: Hello World! 출력하기');
    console.log('   - 설명: Hello World!를 출력하는 프로그램을 작성하시오.');
    console.log('   - 입력: -');
    console.log('   - 출력: Hello World!');
    console.log('   - 언어: C');
    console.log('   - 차시: 1');
  }

  db.close();
});
