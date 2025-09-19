const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 힌트를 여러 줄로 수정 중...\n');

// 여러 줄로 나눈 보기 쉬운 힌트
const betterHints = [
  {
    id: 1,
    hints: 'printf 함수를 사용하세요.\n문자열은 큰따옴표("")로 감싸주세요.'
  },
  {
    id: 2,
    hints: '홍길동이라는 이름을\nprintf 함수로 출력하세요.'
  },
  {
    id: 3,
    hints: '인사말을 printf 함수로 출력하세요.\n한글도 출력할 수 있어요.'
  },
  {
    id: 4,
    hints: '1. 정수형 변수를 선언하세요\n2. 값을 저장하세요\n3. %d로 출력하세요'
  },
  {
    id: 5,
    hints: '1. 문자형 변수를 선언하세요\n2. 값을 저장하세요\n3. %c로 출력하세요'
  },
  {
    id: 6,
    hints: '1. 실수형 변수를 선언하세요\n2. 값을 저장하세요\n3. %f로 출력하세요'
  },
  {
    id: 7,
    hints: '두 숫자를 더하는\n계산식을 만들어서\n결과를 출력하세요'
  },
  {
    id: 8,
    hints: '큰 수에서 작은 수를\n빼는 계산식을 만들어서\n결과를 출력하세요'
  },
  {
    id: 9,
    hints: '두 숫자를 곱하는\n계산식을 만들어서\n결과를 출력하세요'
  },
  {
    id: 10,
    hints: 'printf를 여러 번 사용하거나\n\\n을 사용해서\n줄바꿈하여 출력하세요'
  }
];

db.serialize(() => {
  console.log('📚 여러 줄 힌트로 업데이트 중...\n');
  
  betterHints.forEach((update, index) => {
    setTimeout(() => {
      db.run(`UPDATE problems SET hints = ? WHERE id = ?`,
        [update.hints, update.id], 
        function(err) {
          if (err) {
            console.error(`문제 ${update.id} 힌트 업데이트 실패:`, err.message);
          } else {
            console.log(`✅ 문제 ${update.id}: 여러 줄 힌트로 수정 완료`);
          }
          
          if (index === betterHints.length - 1) {
            console.log('\n🎉 모든 힌트를 여러 줄로 수정 완료!');
            console.log('✅ 보기 쉬운 형태로 변경됨');
            db.close();
          }
        });
    }, index * 100);
  });
});