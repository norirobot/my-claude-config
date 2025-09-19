const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('1차시 문제들 확인 중...\n');

db.all("SELECT id, title, hints, outputExample FROM problems WHERE lesson = 1 ORDER BY id", (err, rows) => {
  if (err) {
    console.error('오류:', err);
  } else {
    rows.forEach((row, index) => {
      console.log(`=== ${index + 1}번 문제 (ID: ${row.id}) ===`);
      console.log(`제목: ${row.title}`);
      console.log(`출력 예시: ${row.outputExample}`);
      console.log(`힌트: ${row.hints}`);
      console.log('');
    });
  }
  
  db.close();
});