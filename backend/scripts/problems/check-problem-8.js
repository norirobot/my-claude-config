const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('8번 문제 상세 정보 확인 중...\n');

db.get('SELECT * FROM problems WHERE id = 8', (err, row) => {
  if (err) {
    console.error('오류:', err);
  } else if (row) {
    console.log('=== 8번 문제 상세 정보 ===');
    console.log('ID:', row.id);
    console.log('제목:', row.title);
    console.log('설명:', row.description);
    console.log('예상 출력:');
    console.log(row.outputExample);
    console.log('\n솔루션 코드:');
    console.log(row.solution);
    console.log('\n힌트:');
    console.log(row.hints);
    console.log('차시:', row.lesson);
  } else {
    console.log('8번 문제를 찾을 수 없습니다.');
  }

  db.close();
});
