const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('조윤호 학생의 제출된 코드들 확인 중...\n');

db.all(`
  SELECT ps.problemId, p.title, p.lesson, ps.code, ps.stars, ps.status
  FROM problem_solutions ps
  JOIN problems p ON ps.problemId = p.id
  WHERE ps.studentId = (SELECT id FROM students WHERE studentId = 'S037')
  ORDER BY p.lesson, p.id
`, (err, rows) => {
  if (err) {
    console.error('오류:', err);
  } else {
    console.log('=== 조윤호 학생이 제출한 코드들 ===');
    rows.forEach(row => {
      console.log(`\n${row.lesson}차시 - ${row.title} (문제 ${row.problemId}번)`);
      console.log(`별점: ${row.stars}개, 상태: ${row.status}`);
      console.log('제출한 코드:');
      console.log(row.code || '(코드 없음)');
      console.log('-'.repeat(80));
    });
    
    if (rows.length === 0) {
      console.log('제출된 코드가 없습니다.');
    }
  }
  
  db.close();
});