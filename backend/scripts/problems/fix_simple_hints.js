const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 힌트를 간단하고 자연스럽게 수정 중...\n');

// 자연스럽고 간단한 힌트
const simpleHints = [
  {
    id: 1,
    hints: 'printf 함수를 사용해서 문자열을 출력하세요.'
  },
  {
    id: 2,
    hints: 'printf 함수로 홍길동을 출력하면 됩니다.'
  },
  {
    id: 3,
    hints: 'printf 함수로 인사말을 출력해보세요.'
  },
  {
    id: 4,
    hints: 'int 변수를 선언하고 %d로 출력하세요.'
  },
  {
    id: 5,
    hints: 'char 변수를 선언하고 %c로 출력하세요.'
  },
  {
    id: 6,
    hints: 'float 변수를 선언하고 %f로 출력하세요.'
  },
  {
    id: 7,
    hints: '10 + 20을 계산해서 결과를 출력하세요.'
  },
  {
    id: 8,
    hints: '100 - 30을 계산해서 결과를 출력하세요.'
  },
  {
    id: 9,
    hints: '5 * 6을 계산해서 결과를 출력하세요.'
  },
  {
    id: 10,
    hints: 'printf를 두 번 사용하거나 \\n을 사용해서 줄바꿈하세요.'
  }
];

db.serialize(() => {
  console.log('📚 간단한 힌트로 업데이트 중...\n');

  simpleHints.forEach((update, index) => {
    setTimeout(() => {
      db.run('UPDATE problems SET hints = ? WHERE id = ?',
        [update.hints, update.id],
        function(err) {
          if (err) {
            console.error(`문제 ${update.id} 힌트 업데이트 실패:`, err.message);
          } else {
            console.log(`✅ 문제 ${update.id}: 간단한 힌트로 수정 완료`);
          }

          if (index === simpleHints.length - 1) {
            console.log('\n🎉 모든 힌트를 간단하고 자연스럽게 수정 완료!');
            console.log('✅ 한 줄로 깔끔하게 변경됨');

            // 최종 결과 확인
            console.log('\n📋 수정된 힌트 확인:');
            db.all('SELECT id, title, hints FROM problems ORDER BY id LIMIT 5', (err, problems) => {
              if (err) {
                console.error('확인 오류:', err.message);
              } else {
                problems.forEach(problem => {
                  console.log(`   ${problem.id}. ${problem.title}: "${problem.hints}"`);
                });
              }
              db.close();
            });
          }
        });
    }, index * 100);
  });
});
