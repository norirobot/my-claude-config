const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

// 서현준 계정 생성
const username = 'student6';
const password = '1234';
const name = '서현준';

db.run(`INSERT INTO users (username, password, name, role, createdAt) VALUES (?, ?, ?, ?, ?)`,
  [username, password, name, 'student', new Date().toISOString()], 
  function(err) {
    if (err) {
      console.error('사용자 생성 실패:', err.message);
    } else {
      console.log(`✅ 사용자 '${name}' (${username}) 생성 완료 - ID: ${this.lastID}`);
      console.log(`🔑 로그인 정보: ${username} / ${password}`);
    }
    db.close();
  });