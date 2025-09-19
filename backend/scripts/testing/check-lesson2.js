const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('2차시 문제들 확인 중...\n');

db.all("SELECT id, title, lesson, starterCode FROM problems WHERE lesson = 2 ORDER BY id", (err, rows) => {
  if (err) {
    console.error('오류:', err);
  } else {
    console.log('=== 2차시 문제들 ===');
    rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.title}`);
      console.log('스타터 코드:');
      console.log(row.starterCode);
      console.log('');
    });
  }
  
  db.close();
});