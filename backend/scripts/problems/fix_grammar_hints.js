const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 문법 중심의 힌트로 수정 중...\n');

// 문법과 사용법 중심의 힌트 (답을 직접 알려주지 않음)
const grammarHints = [
  {
    id: 1,
    hints: 'printf("문자열"); 형태로 사용합니다.'
  },
  {
    id: 2,
    hints: 'printf("문자열"); 형태로 사용합니다.'
  },
  {
    id: 3,
    hints: 'printf("문자열"); 형태로 사용합니다.'
  },
  {
    id: 4,
    hints: 'int 변수명 = 값; 으로 선언하고 printf("%d", 변수명); 으로 출력합니다.'
  },
  {
    id: 5,
    hints: 'char 변수명 = \'문자\'; 으로 선언하고 printf("%c", 변수명); 으로 출력합니다.'
  },
  {
    id: 6,
    hints: 'float 변수명 = 값; 으로 선언하고 printf("%f", 변수명); 으로 출력합니다.'
  },
  {
    id: 7,
    hints: '숫자 + 숫자 형태로 계산하고 printf("%d", 결과); 로 출력합니다.'
  },
  {
    id: 8,
    hints: '숫자 - 숫자 형태로 계산하고 printf("%d", 결과); 로 출력합니다.'
  },
  {
    id: 9,
    hints: '숫자 * 숫자 형태로 계산하고 printf("%d", 결과); 로 출력합니다.'
  },
  {
    id: 10,
    hints: 'printf를 여러 번 사용하거나 \\n을 문자열 안에 넣어 줄바꿈합니다.'
  }
];

db.serialize(() => {
  console.log('📚 문법 중심 힌트로 업데이트 중...\n');

  grammarHints.forEach((update, index) => {
    setTimeout(() => {
      db.run('UPDATE problems SET hints = ? WHERE id = ?',
        [update.hints, update.id],
        function(err) {
          if (err) {
            console.error(`문제 ${update.id} 힌트 업데이트 실패:`, err.message);
          } else {
            console.log(`✅ 문제 ${update.id}: 문법 중심 힌트로 수정 완료`);
          }

          if (index === grammarHints.length - 1) {
            console.log('\n🎉 모든 힌트를 문법 중심으로 수정 완료!');
            console.log('✅ 답이 아닌 문법 사용법 안내로 변경됨');

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
