const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 1번 문제의 starterCode 확인');

db.get(`SELECT id, title, starterCode, LENGTH(starterCode) as code_length FROM problems WHERE id = 1`, [], (err, row) => {
  if (err) {
    console.error('❌ 쿼리 오류:', err);
  } else if (row) {
    console.log('✅ 1번 문제 데이터:');
    console.log('   - ID:', row.id);
    console.log('   - 제목:', row.title);
    console.log('   - starterCode 길이:', row.code_length);
    console.log('   - starterCode 내용:');
    console.log('---');
    console.log(row.starterCode);
    console.log('---');
  } else {
    console.log('❌ 1번 문제를 찾을 수 없습니다');
  }
  
  db.close();
});