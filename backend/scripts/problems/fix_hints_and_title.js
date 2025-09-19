const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 힌트 추가 및 제목 수정 중...\n');

// 문제별 힌트와 제목 수정 데이터
const updates = [
  {
    id: 1,
    title: 'Hello World',
    hints: 'printf("Hello World"); 를 사용하세요.'
  },
  {
    id: 2,
    title: '홍길동 출력하기',
    hints: 'printf("홍길동"); 를 사용하세요.'
  },
  {
    id: 3,
    title: '간단한 인사',
    hints: 'printf("안녕하세요!"); 를 사용하세요.'
  },
  {
    id: 4,
    title: '정수 변수 출력',
    hints: 'int num = 42; 변수를 선언하고 printf("%d", num); 으로 출력하세요.'
  },
  {
    id: 5,
    title: '문자 변수 출력',
    hints: 'char ch = \'A\'; 변수를 선언하고 printf("%c", ch); 으로 출력하세요.'
  },
  {
    id: 6,
    title: '실수 변수 출력',
    hints: 'float f = 3.14; 변수를 선언하고 printf("%f", f); 으로 출력하세요.'
  },
  {
    id: 7,
    title: '덧셈 계산',
    hints: 'int result = 10 + 20; 으로 계산하고 printf("%d", result); 로 출력하세요.'
  },
  {
    id: 8,
    title: '뺄셈 계산',
    hints: 'int result = 100 - 30; 으로 계산하고 printf("%d", result); 로 출력하세요.'
  },
  {
    id: 9,
    title: '곱셈 계산',
    hints: 'int result = 5 * 6; 으로 계산하고 printf("%d", result); 로 출력하세요.'
  }
];

db.serialize(() => {
  console.log('📚 문제 제목 및 힌트 업데이트 중...\n');

  updates.forEach((update, index) => {
    setTimeout(() => {
      db.run('UPDATE problems SET title = ?, hints = ? WHERE id = ?',
        [update.title, update.hints, update.id],
        function(err) {
          if (err) {
            console.error(`문제 ${update.id} 업데이트 실패:`, err.message);
          } else {
            console.log(`✅ 문제 ${update.id}: "${update.title}" - 힌트 추가 완료`);
          }

          if (index === updates.length - 1) {
            console.log('\n🎉 모든 문제 업데이트 완료!');
            console.log('✅ 문제 2번 제목: "내 이름 출력하기" → "홍길동 출력하기"');
            console.log('✅ 모든 문제에 힌트 추가');

            // 업데이트 결과 확인
            console.log('\n📋 업데이트 결과 확인:');
            db.all('SELECT id, title, hints FROM problems ORDER BY id', (err, problems) => {
              if (err) {
                console.error('확인 오류:', err.message);
              } else {
                problems.forEach(problem => {
                  console.log(`   ${problem.id}. ${problem.title}`);
                  console.log(`      힌트: ${problem.hints || '없음'}`);
                });
              }
              db.close();
            });
          }
        });
    }, index * 100);
  });
});
