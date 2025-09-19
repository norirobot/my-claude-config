const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 실용적인 힌트로 수정 중...\n');

// 실용적이고 중복되지 않는 힌트
const practicalHints = [
  {
    id: 1,
    hints: 'printf("내용"); 형태로 작성하세요.'
  },
  {
    id: 2,
    hints: 'printf("내용"); 형태로 작성하세요.'
  },
  {
    id: 3,
    hints: 'printf("내용"); 형태로 작성하세요.'
  },
  {
    id: 4,
    hints: 'int num = 42; printf("%d", num); 형태로 작성하세요.'
  },
  {
    id: 5,
    hints: 'char ch = \'A\'; printf("%c", ch); 형태로 작성하세요.'
  },
  {
    id: 6,
    hints: 'float f = 3.14; printf("%.6f", f); 형태로 작성하세요.'
  },
  {
    id: 7,
    hints: 'printf("%d", 10 + 20); 또는 변수를 사용하세요.'
  },
  {
    id: 8,
    hints: 'printf("%d", 100 - 30); 또는 변수를 사용하세요.'
  },
  {
    id: 9,
    hints: 'printf("%d", 5 * 6); 또는 변수를 사용하세요.'
  },
  {
    id: 10,
    hints: 'printf("Hello\\nRONCO World!"); 또는 printf 두 번 사용하세요.'
  }
];

db.serialize(() => {
  console.log('📚 실용적인 힌트로 업데이트 중...\n');
  
  practicalHints.forEach((update, index) => {
    setTimeout(() => {
      db.run(`UPDATE problems SET hints = ? WHERE id = ?`,
        [update.hints, update.id], 
        function(err) {
          if (err) {
            console.error(`문제 ${update.id} 힌트 업데이트 실패:`, err.message);
          } else {
            console.log(`✅ 문제 ${update.id}: 실용적인 힌트로 수정 완료`);
          }
          
          if (index === practicalHints.length - 1) {
            console.log('\n🎉 모든 힌트를 실용적으로 수정 완료!');
            console.log('✅ 문제와 중복되지 않는 유용한 힌트로 변경됨');
            
            // 최종 결과 확인
            console.log('\n📋 수정된 힌트 확인:');
            db.all('SELECT id, title, hints FROM problems ORDER BY id LIMIT 5', (err, problems) => {
              if (err) {
                console.error('확인 오류:', err.message);
              } else {
                problems.forEach(problem => {
                  console.log(`   ${problem.id}. ${problem.title}:`);
                  console.log(`      힌트: ${problem.hints}`);
                });
              }
              db.close();
            });
          }
        });
    }, index * 100);
  });
});