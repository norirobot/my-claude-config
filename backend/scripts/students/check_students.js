const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔍 현재 데이터베이스 상태 확인 중...');

db.all('SELECT * FROM users WHERE role = "student" ORDER BY username', (err, rows) => {
  if (err) {
    console.error('오류:', err.message);
  } else {
    console.log('\n📋 현재 학생 계정 목록:');
    if (rows && rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.username} / ${row.password} (${row.name})`);
      });
      console.log(`\n✅ 총 ${rows.length}명의 학생 계정이 있습니다.`);
    } else {
      console.log('❌ 학생 계정이 없습니다.');
    }
  }

  // 문제도 확인
  db.all('SELECT id, title, lesson FROM problems ORDER BY lesson', (err, problems) => {
    if (err) {
      console.error('문제 확인 오류:', err.message);
    } else {
      console.log('\n📚 현재 문제 목록:');
      if (problems && problems.length > 0) {
        problems.forEach((problem, index) => {
          console.log(`${index + 1}. [차시 ${problem.lesson}] ${problem.title}`);
        });
        console.log(`\n✅ 총 ${problems.length}개의 문제가 있습니다.`);
      } else {
        console.log('❌ 문제가 없습니다.');
      }
    }
    db.close();
  });
});
