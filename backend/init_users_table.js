const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

// users 테이블 생성
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('users 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ users 테이블 생성 완료');
    }
  });

  // 관리자 계정 생성
  db.run(`INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)`,
    ['admin', 'admin123', '관리자', 'teacher'], 
    function(err) {
      if (err) {
        console.error('관리자 계정 생성 실패:', err.message);
      } else {
        console.log('✅ 관리자 계정 (admin/admin123) 생성 완료');
      }
    });

  // 서현준 계정 생성
  db.run(`INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)`,
    ['student6', '1234', '서현준', 'student'], 
    function(err) {
      if (err) {
        console.error('서현준 계정 생성 실패:', err.message);
      } else {
        console.log('✅ 서현준 계정 (student6/1234) 생성 완료');
      }
      db.close();
    });
});