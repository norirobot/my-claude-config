const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 1번 문제 완전 삭제 및 재생성 시작');

// 1. 기존 1번 문제 완전 삭제
db.run('DELETE FROM problems WHERE id = 1', [], function(err) {
  if (err) {
    console.error('❌ 기존 1번 문제 삭제 실패:', err);
    return;
  }
  console.log('✅ 기존 1번 문제 완전 삭제 완료');

  // 2. 새로운 1번 문제 생성
  db.run(`
    INSERT INTO problems (
      title, description, language, difficulty, category, lesson,
      expectedOutput, starterCode, solution, hints, createdAt, updatedAt,
      isActive, inputExample, outputExample
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?)
  `, [
    'Hello World! 출력하기 (새버전)',
    'Hello World!를 출력하는 프로그램을 작성하시오.',
    'c',
    'easy',
    '기초',
    1,
    'Hello World!',
    '#include <stdio.h>\n\nint main()\n{\n    // 여기에 코드를 작성하세요\n    return 0;\n}',
    '#include <stdio.h>\n\nint main()\n{\n    printf("Hello World!");\n    return 0;\n}',
    '1. #include <stdio.h>를 사용하세요\n2. printf() 함수를 사용하세요\n3. 문자열은 쌍따옴표로 감싸주세요',
    1,
    '-',
    'Hello World!'
  ], function(err) {
    if (err) {
      console.error('❌ 새 1번 문제 생성 실패:', err);
    } else {
      console.log(`✅ 새 1번 문제 생성 완료 (ID: ${this.lastID})`);
      console.log('📋 문제 내용:');
      console.log('   - 제목: Hello World! 출력하기 (새버전)');
      console.log('   - 시작코드: 포함됨');
      console.log('   - 차시: 1');
    }

    // 3. 현재 활성화된 1차시 문제들 확인
    db.all('SELECT id, title, isActive, starterCode FROM problems WHERE lesson = 1 ORDER BY id', [], (err, rows) => {
      if (err) {
        console.error('❌ 1차시 문제 확인 실패:', err);
      } else {
        console.log('\n📚 현재 1차시 문제 목록:');
        rows.forEach(row => {
          console.log(`   - ID ${row.id}: ${row.title} (활성: ${row.isActive ? '✅' : '❌'}) (시작코드: ${row.starterCode ? '✅' : '❌'})`);
        });
      }

      db.close();
    });
  });
});
