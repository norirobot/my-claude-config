const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('중복 문제 확인 중...\n');

db.all('SELECT id, title, outputExample, solution FROM problems WHERE id IN (4, 7, 9, 12) ORDER BY id', (err, rows) => {
  if (err) {
    console.error('오류:', err);
  } else {
    console.log('문제 4, 7, 9, 12번 확인:');
    rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.title}`);
      console.log(`  출력: ${row.outputExample}`);
      console.log(`  솔루션: ${row.solution}`);
      console.log('');
    });
  }

  db.close();
});
