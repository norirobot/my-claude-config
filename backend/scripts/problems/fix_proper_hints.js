const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 적절한 힌트로 수정 중...\n');

// 정답이 아닌 적절한 힌트로 수정
const properHints = [
  {
    id: 1,
    hints: 'printf 함수를 사용해서 문자열을 출력해보세요. 문자열은 큰따옴표("")로 감싸주세요.'
  },
  {
    id: 2,
    hints: '홍길동이라는 이름을 printf 함수로 출력하면 됩니다.'
  },
  {
    id: 3,
    hints: '인사말을 printf 함수로 출력해보세요. 한글도 출력할 수 있어요.'
  },
  {
    id: 4,
    hints: '정수형 변수를 선언하고 값을 저장한 후, %d 형식지정자로 출력하세요.'
  },
  {
    id: 5,
    hints: '문자형 변수를 선언하고 값을 저장한 후, %c 형식지정자로 출력하세요.'
  },
  {
    id: 6,
    hints: '실수형 변수를 선언하고 값을 저장한 후, %f 형식지정자로 출력하세요.'
  },
  {
    id: 7,
    hints: '두 숫자를 더하는 계산식을 만들고 결과를 출력하세요.'
  },
  {
    id: 8,
    hints: '큰 수에서 작은 수를 빼는 계산식을 만들고 결과를 출력하세요.'
  },
  {
    id: 9,
    hints: '두 숫자를 곱하는 계산식을 만들고 결과를 출력하세요.'
  }
];

db.serialize(() => {
  console.log('📚 적절한 힌트로 업데이트 중...\n');

  properHints.forEach((update, index) => {
    setTimeout(() => {
      db.run('UPDATE problems SET hints = ? WHERE id = ?',
        [update.hints, update.id],
        function(err) {
          if (err) {
            console.error(`문제 ${update.id} 힌트 업데이트 실패:`, err.message);
          } else {
            console.log(`✅ 문제 ${update.id}: 힌트 수정 완료`);
          }

          if (index === properHints.length - 1) {
            console.log('\n🎉 모든 힌트 수정 완료!');
            console.log('✅ 정답을 직접 알려주지 않는 적절한 힌트로 변경');

            // 업데이트 결과 확인
            console.log('\n📋 수정된 힌트 확인:');
            db.all('SELECT id, title, hints FROM problems ORDER BY id', (err, problems) => {
              if (err) {
                console.error('확인 오류:', err.message);
              } else {
                problems.forEach(problem => {
                  console.log(`   ${problem.id}. ${problem.title}`);
                  console.log(`      힌트: ${problem.hints || '없음'}`);
                  console.log('');
                });
              }
              db.close();
            });
          }
        });
    }, index * 100);
  });
});
