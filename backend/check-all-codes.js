const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('현재 저장된 모든 코드 확인 중...\n');

// 조윤호 학생의 저장된 코드들 확인
db.all(`
  SELECT ps.problemId, p.title, p.lesson, ps.code, ps.stars
  FROM problemStatus ps
  JOIN problems p ON ps.problemId = p.id
  WHERE ps.studentId = (SELECT id FROM students WHERE studentId = 'S037')
  ORDER BY p.lesson, p.id
`, (err, rows) => {
  if (err) {
    console.error('오류:', err);
  } else {
    console.log('=== 조윤호 학생의 저장된 코드들 ===');
    rows.forEach(row => {
      console.log(`\n${row.lesson}차시 - ${row.title} (문제 ${row.problemId}번)`);
      console.log(`점수: ${row.stars}점`);
      console.log('코드:');
      console.log(row.code || '(코드 없음)');
      console.log('-'.repeat(50));
    });
  }
  
  db.close();
});