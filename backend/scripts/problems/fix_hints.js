const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.run('ALTER TABLE problems ADD COLUMN hints TEXT', (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('오류:', err.message);
  } else {
    console.log('✅ hints 컬럼 추가 완료');
  }
  db.close();
});
