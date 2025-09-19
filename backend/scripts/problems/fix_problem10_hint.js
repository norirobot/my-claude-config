const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 문제 10번 힌트 추가 중...\n');

db.run('UPDATE problems SET hints = ? WHERE id = 10',
  ['printf 함수를 사용해서 여러 줄로 나누어 출력해보세요. \\n을 사용하면 줄바꿈이 됩니다.'],
  function(err) {
    if (err) {
      console.error('문제 10 힌트 업데이트 실패:', err.message);
    } else {
      console.log('✅ 문제 10번 힌트 추가 완료');

      // 결과 확인
      db.get('SELECT id, title, hints FROM problems WHERE id = 10', (err, problem) => {
        if (err) {
          console.error('확인 오류:', err.message);
        } else {
          console.log('\n📋 문제 10번 힌트 확인:');
          console.log(`   제목: ${problem.title}`);
          console.log(`   힌트: ${problem.hints}`);
        }
        db.close();
      });
    }
  });
